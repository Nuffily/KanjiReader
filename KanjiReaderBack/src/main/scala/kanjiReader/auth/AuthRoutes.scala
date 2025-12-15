package kanjiReader.auth

import zio.http._
import zio._
import zio.json.EncoderOps

object AuthRoutes {

  def apply(): Routes[Client & AuthService, Response] = Routes(
    Method.GET / "getAccessToken" -> handler { (req: Request) =>
      val code = req.url.queryParams("code").head

      (for {
        service <- ZIO.service[AuthService]
        token   <- service.getAccessToken(code)
      } yield Response.json(token.toJson))
        .catchAll {
          case AuthBadToken(message) =>
            ZIO.succeed(
              Response
                .text(message)
                .status(Status.Unauthorized) // 401
            )
          case AuthDunnoTokenError(message) =>
            ZIO.logError(s"Get user data error: ${message}") *>
              ZIO.succeed(
                Response
                  .text(s"Failed to get user data: ${message}")
                  .status(Status.InternalServerError)
              )

        }
    },
    Method.GET / "getUserData" -> handler { (req: Request) =>
      {
        req.header(Header.Authorization) match {
          case Some(authHeader) =>
            (for {
              service <- ZIO.service[AuthService]
              user    <- service.getUserData(authHeader)
            } yield Response.json(user.toJson))
              .catchAll {

                case AuthBadUserError(message) =>
                  ZIO.succeed(
                    Response
                      .text(message)
                      .status(Status.Unauthorized) // 401
                  )
                case AuthDunnoUserError(message) =>
                  ZIO.logError(s"Get user data error: ${message}") *>
                    ZIO.succeed(
                      Response
                        .text(s"Failed to get user data: ${message}")
                        .status(Status.InternalServerError)
                    )

              }
          case None =>
            ZIO.succeed(
              Response
                .text("Authorization header is required")
                .status(Status.BadRequest)
            )
        }
      }
    }
  )
}
