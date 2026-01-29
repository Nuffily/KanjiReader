package kanjiReader

import zio.ZIO
import zio.http.{Request, Response, Status}

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

}
