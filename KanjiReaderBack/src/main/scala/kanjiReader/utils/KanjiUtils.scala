package kanjiReader

import zio.ZIO
import zio.http.{Request, Response, Status}

object KanjiResponse {

  lazy val noAuthorization: ZIO[Any, Nothing, Response] =
    ZIO.succeed(
      Response
        .text("Authorization header is required")
        .status(Status.BadRequest)
    )

  def unauthorized(message: String): ZIO[Any, Nothing, Response] =
    ZIO.succeed(
      Response
        .text(message)
        .status(Status.Unauthorized)
    )


  def getIntBodyOrBad(req: Request): ZIO[Any, Response, Int] = for {
    bodyString <- req.body.asString.orElseFail(Response.badRequest)

    id <- ZIO
      .fromOption(bodyString.trim.toIntOption)
      .orElseFail(Response.badRequest("Invalid integer format for id"))
  } yield id

}
