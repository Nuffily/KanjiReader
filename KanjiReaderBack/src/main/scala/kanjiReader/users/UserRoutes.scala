//package kanjiReader.users
//
//import zio._
//import zio.http._
//import zio.json.{
//  DeriveJsonDecoder,
//  DeriveJsonEncoder,
//  EncoderOps,
//  JsonDecoder,
//  JsonEncoder
//}
//import zio.schema.codec.JsonCodec.schemaBasedBinaryCodec
//
///** Collection of routes that:
//  *   - Accept a `Request` and returns a `Response`
//  *   - May fail with type of `Response`
//  *   - Require a `UserRepo` from the environment
//  */
//object UserRoutes {
//
//  def apply(): Routes[UserRepo, Response] =
//    Routes(
//      Method.POST / "register" -> handler { (req: Request) =>
//        for {
//          u <- req.body.to[User].orElseFail(Response.badRequest)
//          r <-
//            UserRepo
//              .register(u)
//              .mapBoth(
//                _ =>
//                  Response
//                    .internalServerError(s"Failed to register the user: $u"),
//                {
//                  case Some(uuid) => Response.text(uuid)
//                  case None =>
//                    Response(
//                      Status.Conflict,
//                      body = Body.fromString("User already exists")
//                    )
//                }
//              )
//        } yield r
//      },
//      Method.POST / "login" -> handler { (req: Request) =>
//        for {
//          u <- req.body.to[User].orElseFail(Response.badRequest)
//          r <-
//            UserRepo
//              .login(u)
//              .mapBoth(
//                _ =>
//                  Response
//                    .internalServerError(s"Failed to register the user: $u"),
//                {
//                  case Some(uuid) => Response.text(uuid)
//                  case None =>
//                    Response(
//                      Status.Conflict,
//                      body = Body.fromString("Incorrect login or password")
//                    )
//                }
//              )
//        } yield r
//      },
//      Method.POST / "getLogin" -> handler { (req: Request) =>
//        for {
//          id <- req.body.asString.orElseFail(Response.badRequest)
//          r <-
//            UserRepo
//              .lookup(id)
//              .mapBoth(
//                _ =>
//                  Response
//                    .internalServerError(s"Failed to lookup for id: $id"),
//                {
//                  case Some(login) => Response.text(login)
//                  case None =>
//                    Response(
//                      Status.Conflict,
//                      body = Body.fromString("No such id in DB")
//                    )
//                }
//              )
//        } yield r
//      },
//      Method.POST / "getRecords" -> handler { (req: Request) =>
//        for {
//          id <- req.body.asString.orElseFail(Response.badRequest)
//          r <-
//            UserRepo
//              .getRecords(id)
//              .mapBoth(
//                _ =>
//                  Response
//                    .internalServerError(s"Failed to lookup for id: $id"),
//                {
//                  case Some(records) => Response.json(records.toJson)
//                  case None => Response.status(Status.NotFound)
//                }
//              )
//        } yield r
//      }
//
////      Method.GET / "users" -> handler { (req: Request) =>
////        for {
////          users <- UserRepo.getAllUsers
////            .mapBoth(
////              error => Response.internalServerError(s"Failed to get users: ${error.getMessage}"),
////              users => {
////                implicit val encoder: JsonEncoder[List[UserTable]] = DeriveJsonEncoder.gen[List[UserTable]]
////                Response.json(users.toJson)
////              }
////            )
////        } yield users
////      }
//
//    )
//}
