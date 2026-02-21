package kanjiReader.auth

import kanjiReader.KanjiResponse
import kanjiReader.kanjiUsers.UserRepo
import zio._
import zio.http.Header.Authorization.Bearer
import zio.http.{Method, _}
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
          case AuthBadToken(message) =>
            KanjiResponse.unauthorized(message)

          case AuthDunnoTokenError(message) =>
            ZIO.logError(s"Get user data error: $message") *>
              KanjiResponse.unauthorized(s"Failed to get user data: $message")
        }
    },

    /** Принимает токен Authorization и возвращает данные пользователя с API
      * GitHub
      */
    Method.GET / "getUserGitData" -> handler { (req: Request) =>
      withToken(req) { token =>
        ZIO
          .serviceWithZIO[AuthService](_.getUserGitData(token))
          .map(u => Response.json(u.toJson))
      }.catchAll(handleAuthError)
    },

    /** Принимает токен Authorization и возвращает данные пользователя в виде
      * KanjiUser
      */
    Method.GET / "getKanjiUserData" -> handler { (req: Request) =>
      withToken(req) { token =>
        ZIO
          .serviceWithZIO[AuthService](_.getKanjiUserData(token))
          .map(u => Response.json(u.toJson))
      }.catchAll(handleAuthError)
    }
//      {
//        req.header(Header.Authorization) match {
//
//          case Some(Bearer(token)) =>
//            (for {
//              service <- ZIO.service[AuthService]
//
//              user <- service.getKanjiUserData(Bearer(token))
//            } yield Response.json(user.toJson))
//              .catchAll(handleAuthError)
//          case None =>
//            KanjiResponse.noAuthorization
//        }
//      }
//    }
  )

  private def withToken(
      req: Request
  )(f: Bearer => ZIO[AuthService & UserRepo & Client, AuthUserDataError, Response]) =
    req.header(Header.Authorization) match {
      case Some(auth @ Bearer(_)) => f(auth)
      case None                   => KanjiResponse.noAuthorization
    }

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
