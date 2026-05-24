package kanjiReader

import kanjiReader.base.auth.token.cache.{
  InMemoryTokenCache,
  RedisTokenCache,
  TokenCache
}
import kanjiReader.base.auth.{
  AuthRoutes,
  AuthService,
  GitHubService,
  GitHubUser
}
import kanjiReader.base.kanjiUsers.{PersistentUserRepo, UserRepo}
import kanjiReader.base.leveling.handler.KanjiQuestHandler
import kanjiReader.base.leveling.{KanjiLevelService, LevelRoutes, LevelService}
import kanjiReader.base.statistics.{
  KanjiStatisticsService,
  StatisticsRoutes,
  StatisticsService
}
import kanjiReader.base.vocabulary.{KanjiWordService, VocabularyRoutes}
import kanjiReader.config.{GitHubConfig, HttpServerConfig, KanjiRedisConfig}
import zio.config.typesafe.TypesafeConfigProvider
import zio.http.Header.Authorization
import zio.http.Header.Authorization.Bearer
import zio.http.Middleware.CorsConfig
import zio.http.netty.NettyConfig
import zio.http.{
  Client,
  HandlerAspect,
  Header,
  Middleware,
  Request,
  Response,
  Server
}
import zio.{
  &,
  Config,
  Console,
  Random,
  Runtime,
  ZIO,
  ZIOAppArgs,
  ZIOAppDefault,
  ZLayer
}

object MainApp extends ZIOAppDefault {

  private val randomLayer: ZLayer[Any, Nothing, Random] =
    ZLayer.succeed(Random.RandomLive)

  override val bootstrap: ZLayer[ZIOAppArgs, Any, Any] =
    Runtime.setConfigProvider(
      TypesafeConfigProvider
        .fromResourcePath()
    )

  private val serverConfig: ZLayer[Any, Config.Error, Server.Config] =
    ZLayer
      .fromZIO(
        ZIO.config[HttpServerConfig](HttpServerConfig.config).map { c =>
          Server.Config.default.binding(c.host, c.port)
        }
      )

  private val gitHubConfigLayer: ZLayer[Any, Config.Error, GitHubConfig] =
    ZLayer.fromZIO(ZIO.config[GitHubConfig](GitHubConfig.config))

  private val nettyConfig: ZLayer[Any, Config.Error, NettyConfig] =
    ZLayer
      .fromZIO(
        ZIO.config[HttpServerConfig](HttpServerConfig.config).map { c =>
          NettyConfig.default.maxThreads(c.nThreads)
        }
      )

  private val simpleCors = Middleware.cors(
    config = CorsConfig(
      allowedOrigin = { _ => Some(Header.AccessControlAllowOrigin.All) },
      allowedMethods = Header.AccessControlAllowMethods.All,
      allowedHeaders = Header.AccessControlAllowHeaders.All
    )
  )

  private val tokenCacheLayer: ZLayer[Any, Throwable, TokenCache] = {
    (KanjiRedisConfig.layer >+> RedisTokenCache.layer)
      .catchAll(e =>
        ZLayer.fromZIO(
          ZIO.logWarning(
            f"Cannot connect redis, using local store: ${e.exception}"
          )
        ) >>>
          InMemoryTokenCache.layer
      )
  }

  def githubUserMiddleware: HandlerAspect[AuthService & Client, GitHubUser] =
    HandlerAspect.customAuthProvidingZIO { (req: Request) =>
      val maybeToken: Option[Authorization] =
        req.cookie("kanji_github_token").map(c => Bearer(c.content))

      maybeToken match {
        case Some(token @ Bearer(_)) =>
          for {
            authService <- ZIO.service[AuthService]
            userData <- authService
              .getUserGitData(token)
              .mapError(e => Response.unauthorized(s"Invalid credentials: $e"))
          } yield Some(userData)
        case None =>
          ZIO.fail(Response.unauthorized("Missing credentials"))
      }
    }

  def run: ZIO[Any, Throwable, Nothing] = {

    val protectedRoutes = StatisticsRoutes() @@
      [StatisticsService & Client] githubUserMiddleware

    val protectedRoutes2 = LevelRoutes() @@
      [StatisticsService & LevelService & UserRepo & Random & Client] githubUserMiddleware

    val publicRoutes = VocabularyRoutes() ++ AuthRoutes()

    Migrator.run *>
      (Server
        .install(
          (publicRoutes ++ protectedRoutes ++ protectedRoutes2) @@ simpleCors
        )
        .flatMap(port =>
          Console.printLine(s"Started server on port: $port")
        ) *> ZIO.never)
        .provide(
          serverConfig >+> nettyConfig >+> Server.live,
          gitHubConfigLayer ++ tokenCacheLayer >>> GitHubService.layer,
          Client.default,
          KanjiWordService.layer,
          PersistentUserRepo.layer,
          randomLayer,
          KanjiStatisticsService.layer,
          KanjiLevelService.layer(KanjiQuestHandler)
        )
  }
}
