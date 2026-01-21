package kanjiReader.kanjiUsers

import kanjiReader.KanjiResponse
import zio._
import zio.http._
import zio.json.EncoderOps

object UserRoutes {

  def apply(): Routes[UserRepo, Response] =
    Routes(
      Method.POST / "register" -> handler { (req: Request) =>
        for {

          id <- KanjiResponse.getIntBodyOrBad(req)

          r <-
            UserRepo
              .register(id)
              .mapBoth(
                _ =>
                  Response
                    .internalServerError(s"Failed to register the user: $id"),
                {
                  case true => Response.text("Registered")
                  case false =>
                    Response(
                      Status.Conflict,
                      body = Body.fromString("User already exists")
                    )
                }
              )
        } yield r
      },

      Method.POST / "lookup" -> handler { (req: Request) =>
        for {
          bodyString <- req.body.asString.orElseFail(Response.badRequest)

          id <- ZIO.fromOption(bodyString.trim.toIntOption)
            .orElseFail(Response.badRequest("Invalid integer format"))

          r <-
            UserRepo
              .lookupId(id)
              .mapBoth(
                e =>
                  Response
                    .internalServerError(s"Failed to register the user: $e"),
                {
                  case Some(user) => Response.json(user.toJson)
                  case None =>
                    Response(
                      Status.Conflict,
                      body = Body.fromString("No such user")
                    )
                }
              )
        } yield r
      }

    )
}
