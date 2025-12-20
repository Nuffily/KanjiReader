package kanjiReader.auth

import kanjiReader.KanjiResponse
import kanjiReader.kanjiUsers.UserRepo
import zio.Config.Secret
import zio.http.{Method, _}
import zio._
import zio.http.Header.Authorization.Bearer
import zio.json.EncoderOps

object AuthRoutes {

  def apply(): Routes[Client & AuthService & UserRepo, Response] = Routes(
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
    Method.GET / "getUserGitData" -> handler { (req: Request) =>
      {
        req.header(Header.Authorization) match {

          case Some(Bearer(token)) =>
            (for {
              service <- ZIO.service[AuthService]

              user <- service.getUserGitData(Bearer(token))
            } yield Response.json(user.toJson))
              .catchAll {
                case AuthBadUserError(message) =>
                  KanjiResponse.unauthorized(message)

                case AuthDunnoUserError(message) =>
                  ZIO.logError(s"Get user data error: $message") *>
                    KanjiResponse.unauthorized(
                      s"Failed to get user data: $message"
                    )
              }
          case None =>
            KanjiResponse.noAuthorization
        }
      }
    },

    Method.GET / "getKanjiUserData" -> handler { (req: Request) =>
      {
        req.header(Header.Authorization) match {

          case Some(Bearer(token)) =>
            (for {
              service <- ZIO.service[AuthService]

              user <- service.getKanjiUserData(Bearer(token))
            } yield Response.json(user.toJson))
              .catchAll {
                case AuthBadUserError(message) =>
                  KanjiResponse.unauthorized(message)

                case AuthDunnoUserError(message) =>
                  ZIO.logError(s"Get user data error: $message") *>
                    KanjiResponse.unauthorized(
                      s"Failed to get user data: $message"
                    )
              }
          case None =>
            KanjiResponse.noAuthorization
        }
      }
    }
  )
}
