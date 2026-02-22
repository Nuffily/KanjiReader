package kanjiReader.utils

import kanjiReader.auth.{
  AuthBadUserError,
  AuthDunnoUserError,
  AuthUserDataError
}
import zio.ZIO
import zio.http.Header.Authorization.Bearer
import zio.http.{Header, Request, Response, Status}

object KanjiResponse {

  /** Выдает Status.BadRequest с текстом "Authorization header is required"
    */
  lazy val noAuthorization: ZIO[Any, Nothing, Response] =
    ZIO.succeed(
      Response
        .text("Authorization header is required")
        .status(Status.BadRequest)
    )

  /** Выдает Status.Unauthorized с текстом [message]
    */
  def unauthorized(message: String): ZIO[Any, Nothing, Response] =
    ZIO.succeed(
      Response
        .text(message)
        .status(Status.Unauthorized)
    )

  /** Пытается выпарсить из тела [req] int значение. Если не вышло -
    * Response.badRequest("Invalid integer format for id")
    */
  def getIntBodyOrBad(req: Request): ZIO[Any, Response, Int] = for {
    bodyString <- req.body.asString.orElseFail(Response.badRequest)

    id <- ZIO
      .fromOption(bodyString.trim.toIntOption)
      .orElseFail(Response.badRequest("Invalid integer format for id"))
  } yield id

  def withToken[E, R](req: Request)(
    f: Bearer => ZIO[R, E, Response]
  ): ZIO[R, E, Response] =
    req.header(Header.Authorization) match {
      case Some(auth @ Bearer(_)) => f(auth)
      case None                   => noAuthorization
    }

  val handleAuthErrorZIO
  : AuthUserDataError => ZIO[Any, Nothing, Response] = {
    case AuthBadUserError(message) =>
      KanjiResponse.unauthorized(message)
    case AuthDunnoUserError(message) =>
      ZIO.logError(s"Get user data error: $message") *>
        KanjiResponse.unauthorized(
          s"Failed to get user data: $message"
        )
  }

  val handleAuthError
  : AuthUserDataError => Response = {
    case AuthBadUserError(message) =>
      Response.unauthorized(message)
    case AuthDunnoUserError(message) =>
      Response.unauthorized(s"Failed to get user data: $message")
  }

}
