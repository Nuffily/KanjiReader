package kanjiReader.auth

import kanjiReader.utils.KanjiResponse.withToken
import kanjiReader.kanjiUsers.UserRepo
import kanjiReader.utils.KanjiResponse
import zio._
import zio.http.Header.Authorization.Bearer
import zio.http._
import zio.json.EncoderOps

object AuthRoutes {

  def apply(): Routes[Client & AuthService & UserRepo, Response] = Routes(
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
      KanjiResponse.withToken(req) { token =>
        ZIO
          .serviceWithZIO[AuthService](_.getUserGitData(token))
          .map(u => Response.json(u.toJson))
      }.catchAll(handleAuthError)
    },

    /** Принимает токен Authorization и возвращает данные пользователя в виде
      * KanjiUser
      */
    Method.GET / "getKanjiUserData" -> handler { (req: Request) =>
      KanjiResponse.withToken(req) { token =>
        ZIO
          .serviceWithZIO[AuthService](_.getKanjiUserData(token))
          .map(u => Response.json(u.toJson))
      }.catchAll(handleAuthError)
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
