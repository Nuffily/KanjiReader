package kanjiReader.config

import zio.Config
import zio.config.magnolia.deriveConfig

case class GitHubConfig(
    clientId: String,
    clientSecret: String,
    gitHubTokenServer: String,
    gitHubUserServer: String
)

object GitHubConfig {

  val config: Config[GitHubConfig] =
    deriveConfig[GitHubConfig].nested("GitHubConfig")
}
