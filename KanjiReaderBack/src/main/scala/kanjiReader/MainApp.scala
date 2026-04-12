package kanjiReader

import kanjiReader.base.auth.{AuthRoutes, GitHubService}
import kanjiReader.base.kanjiUsers.PersistentUserRepo
import kanjiReader.base.leveling.handler.KanjiQuestHandler
import kanjiReader.base.leveling.{KanjiLevelService, LevelRoutes}
import kanjiReader.base.statistics.{KanjiStatisticsService, StatisticsRoutes}
import kanjiReader.base.vocabulary.{KanjiWordService, VocabularyRoutes}
import kanjiReader.config.{GitHubConfig, HttpServerConfig, KanjiRedisConfig}
import zio.config.typesafe.TypesafeConfigProvider
import zio.http.Middleware.CorsConfig
import zio.http.netty.NettyConfig
import zio.http.{Client, Header, Middleware, Server}
import zio.{
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

  def run: ZIO[Any, Throwable, Nothing] = {

    Migrator.run *>
      (Server
        .install(
          (VocabularyRoutes() ++ AuthRoutes() ++ LevelRoutes() ++ StatisticsRoutes()) @@ simpleCors
        )
        .flatMap(port =>
          Console.printLine(s"Started server on port: $port")
        ) *> ZIO.never)
        .provide(
          serverConfig >+> nettyConfig >+> Server.live,
          gitHubConfigLayer >>> GitHubService.layer,
          Client.default,
          KanjiWordService.layer,
          PersistentUserRepo.layer,
          randomLayer,
          KanjiStatisticsService.layer,
          KanjiLevelService.layer(KanjiQuestHandler),
          KanjiRedisConfig.layer
        )
  }
}
