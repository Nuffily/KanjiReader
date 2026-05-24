package kanjiReader.base.auth.token.cache

import kanjiReader.base.auth.{AuthTokenError, GitHubUser}
import zio.http.Header.Authorization
import zio.{Duration, IO}

trait TokenCache {
  def getUser(token: Authorization): IO[AuthTokenError, GitHubUser]
  def cacheUser(token: Authorization, user: GitHubUser, ttl: Duration): IO[Throwable, Unit]
}