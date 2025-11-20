package kanjiReader

import zio.config.typesafe.TypesafeConfigProvider
import zio.http.Middleware.CorsConfig
import zio.http._
import zio.http.netty.NettyConfig
import zio.{Random, _}
import kanjiReader.config.HttpServerConfig
import kanjiReader.users.{PersistentUserRepo, UserRoutes}
import kanjiReader.vocabulary.zxc.greet.VocabularyRoutes

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

    (Server
      .install(
        UserRoutes() ++ VocabularyRoutes() @@ simpleCors
      )
      .flatMap(port =>
        Console.printLine(s"Started server on port: $port")
      ) *> ZIO.never)
      .provide(
        serverConfig,
        nettyConfig,
        Server.live,

        PersistentUserRepo.layer,
        randomLayer
      )
  }
}
