package kanjiReader.config

import zio.Config
import zio.config.magnolia.deriveConfig

case class HttpServerConfig(host: String, port: Int, nThreads: Int)

object HttpServerConfig {

  val config: Config[HttpServerConfig] =
    deriveConfig[HttpServerConfig].nested("HttpServerConfig")

}
