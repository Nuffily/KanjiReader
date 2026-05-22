package kanjiReader.base.auth.token.cache

import kanjiReader.base.auth.{AuthBadToken, AuthTokenError, GitHubUser}
import zio.http.Header.Authorization
import zio.redis.{Redis, RedisError}
import zio.{Duration, IO, ZIO, ZLayer}

case class KanjiTokenCache(prefix: String, redis: Redis) extends TokenCache {
  private def redisKey(token: String): String =
    s"$prefix:${token.take(50)}"

  override def getUser(auth: Authorization): IO[AuthTokenError, GitHubUser] =
    auth match {
      case Authorization.Bearer(token) =>
        redis
          .get(redisKey(token.value.mkString))
          .returning[GitHubUser]
          .some
          .orElseFail(AuthBadToken("invalid"))

      case _ =>
        ZIO.fail(AuthBadToken("only Bearer token supported"))
    }

  override def cacheUser(auth: Authorization, user: GitHubUser, ttl: Duration): IO[Throwable, Unit] =
    auth match {
      case Authorization.Bearer(token) =>
        redis.set(
          redisKey(token.value.mkString),
          user,
          Some(ttl)
        ).unit

      case _ =>
        ZIO.fail(RedisError.ProtocolError("only Bearer token supported"))
    }
}

object KanjiTokenCache {
  val layer: ZLayer[Redis, Nothing, TokenCache] =
    ZLayer.fromZIO {
      for {
        redis <- ZIO.service[Redis]
      } yield KanjiTokenCache("kanji-auth", redis)
    }
}