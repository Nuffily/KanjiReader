package kanjiReader.kanjiUsers

import zio._
import zio.http._
import zio.json.EncoderOps
import zio.schema.codec.JsonCodec.schemaBasedBinaryCodec

/** Collection of routes that:
  *   - Accept a `Request` and returns a `Response`
  *   - May fail with type of `Response`
  *   - Require a `UserRepo` from the environment
  */
object UserRoutes {

  def apply(): Routes[UserRepo, Response] =
    Routes(
      Method.POST / "register" -> handler { (req: Request) =>
        for {
          bodyString <- req.body.asString.orElseFail(Response.badRequest)
          id <- ZIO.fromOption(bodyString.trim.toIntOption)
            .orElseFail(Response.badRequest("Invalid integer format"))

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
              .lookup(id)
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
