package kanjiReader.base.auth.token.cache

import kanjiReader.base.auth.{AuthBadToken, AuthTokenError, GitHubUser}
import zio.http.Header.Authorization
import zio.{Duration, IO, Ref, ZIO, ZLayer}

case class InMemoryTokenCache(state: Ref[Map[String, (GitHubUser, Long)]]) extends TokenCache {

  private def memoryKey(token: String): String =
    s"kanji-auth:${token.take(50)}"

  override def getUser(auth: Authorization): IO[AuthTokenError, GitHubUser] =
    auth match {
      case Authorization.Bearer(token) =>
        state.get.flatMap { map =>
          map.get(memoryKey(token.value.mkString)) match {
            case Some((user, expireAt)) if System.currentTimeMillis() < expireAt =>
              ZIO.succeed(user)

            case _ =>
              ZIO.fail(AuthBadToken("invalid"))
          }
        }

      case _ =>
        ZIO.fail(AuthBadToken("only Bearer token supported"))
    }

  override def cacheUser(
                          auth: Authorization,
                          user: GitHubUser,
                          ttl: Duration
                        ): IO[Throwable, Unit] =
    auth match {
      case Authorization.Bearer(token) =>
        ZIO.succeed(System.currentTimeMillis() + ttl.toMillis).flatMap { expireAt =>
          state.update(_ + (memoryKey(token.value.mkString) -> (user, expireAt))).unit
        }

      case _ =>
        ZIO.fail(new IllegalArgumentException("only Bearer token supported"))
    }
}

object InMemoryTokenCache {
  val layer: ZLayer[Any, Nothing, TokenCache] =
    ZLayer.fromZIO(
      Ref.make(Map.empty[String, (GitHubUser, Long)]).map(InMemoryTokenCache(_))
    )
}