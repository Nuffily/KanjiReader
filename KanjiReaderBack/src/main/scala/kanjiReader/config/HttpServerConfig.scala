package kanjiReader.config

import zio.Config
import zio.config.magnolia.deriveConfig

case class HttpServerConfig(host: String, port: Int, nThreads: Int)

object HttpServerConfig {

  val config: Config[HttpServerConfig] =
    deriveConfig[HttpServerConfig].nested("HttpServerConfig")

//  val config_manual: Config[HttpServerConfig] =
//    (Config.int.nested("port") ++
//      Config.string.nested("host") ++
//      Config.int.nested("nThreads"))
//      .map { case (port, host, nThreads) =>
//        HttpServerConfig(host, port, nThreads)
//      }
//      .nested("HttpServerConfig")
}
