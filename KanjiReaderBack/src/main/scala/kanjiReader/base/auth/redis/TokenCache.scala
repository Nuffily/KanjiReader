package kanjiReader.base.auth.redis

import kanjiReader.base.auth.{AuthTokenError, GitHubUser}
import zio.http.Header.Authorization
import zio.redis.{Redis, RedisError}
import zio.{Duration, ZIO}

trait TokenCache {
  def getUser(token: Authorization): ZIO[Redis, AuthTokenError, GitHubUser]
  def cacheUser(token: Authorization, user: GitHubUser, ttl: Duration): ZIO[Redis, RedisError, Unit]
//  def invalidate(token: Authorization.Bearer): ZIO[Redis, RedisError, Unit]
}