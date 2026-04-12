package kanjiReader.base.auth.redis

import kanjiReader.base.auth.{AuthBadToken, AuthTokenError, GitHubUser}
import zio.http.Header.Authorization
import zio.redis.{Redis, RedisError}
import zio.{Duration, ZIO}

case class KanjiTokenCache(prefix: String) extends TokenCache {
  private def redisKey(token: String): String =
    s"$prefix:${token.take(50)}"

  override def getUser(
                        auth: Authorization
                      ): ZIO[Redis, AuthTokenError, GitHubUser] =
    auth match {
      case Authorization.Bearer(token) =>
        for {
          redis <- ZIO.service[Redis]
          user <- redis
            .get(redisKey(token.value.mkString))
            .returning[GitHubUser]
            .some
            .orElseFail(AuthBadToken("invalid"))
        } yield user

      case _ =>
        ZIO.fail(AuthBadToken("only Bearer token supported"))
    }

  override def cacheUser(
                          auth: Authorization,
                          user: GitHubUser,
                          ttl: Duration
                        ): ZIO[Redis, RedisError, Unit] =
    auth match {
      case Authorization.Bearer(token) =>
        for {
          redis <- ZIO.service[Redis]
          _ <- redis.set(
            redisKey(token.value.mkString),
            user,
            Some(ttl)
          )
        } yield ()

      case _ =>
        ZIO.fail(RedisError.ProtocolError("only Bearer token supported"))
    }
}