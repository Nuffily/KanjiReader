package kanjiReader.base.auth

import kanjiReader.base.kanjiUsers.UserRepo
import kanjiReader.utils.KanjiResponse
import zio.http.{Client, Method, Request, Response, Routes, handler}
import zio.json.EncoderOps
import zio.redis.Redis
import zio.{&, ZIO}

object AuthRoutes {

  def apply(): Routes[Client & AuthService & UserRepo & Redis, Response] = Routes(
    /** Принимает код входа через гитхаб в url строке и с помощью него получает
      * токен пользователя с API GitHub
      */
    Method.GET / "getAccessToken" -> handler { (req: Request) =>
      val code = req.url.queryParams("code").head

      (for {
        service <- ZIO.service[AuthService]
        token   <- service.getAccessToken(code)
      } yield Response.json(token.toJson))
        .catchAll {
          case AuthBadToken(message) => KanjiResponse.unauthorized(message)
          case AuthDunnoTokenError(message) =>
            ZIO.logError(s"Get user data error: $message") *> KanjiResponse
              .unauthorized(s"Failed to get user data: $message")
        }
    },

    /** Принимает токен Authorization и возвращает данные пользователя с API
      * GitHub
      */
    Method.GET / "getUserGitData" -> handler { (req: Request) =>
      KanjiResponse
        .withToken(req) { token =>
          ZIO
            .serviceWithZIO[AuthService](_.getUserGitData(token))
            .map(u => Response.json(u.toJson))
        }
        .catchAll(handleAuthError)
    },

    /** Принимает токен Authorization и возвращает данные пользователя в виде
      * KanjiUser
      */
    Method.GET / "getKanjiUserData" -> handler { (req: Request) =>
      KanjiResponse
        .withToken(req) { token =>
          ZIO
            .serviceWithZIO[AuthService](_.getKanjiUserData(token))
            .map(u => Response.json(u.toJson))
        }
        .catchAll(handleAuthError)
    }
  )

  private val handleAuthError
      : AuthUserDataError => ZIO[Any, Nothing, Response] = {
    case AuthBadUserError(message) =>
      KanjiResponse.unauthorized(message)
    case AuthDunnoUserError(message) =>
      ZIO.logError(s"Get user data error: $message") *>
        KanjiResponse.unauthorized(
          s"Failed to get user data: $message"
        )
  }
}
