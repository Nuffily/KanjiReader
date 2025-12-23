package kanjiReader.leveling

import kanjiReader.KanjiResponse
import kanjiReader.auth.{AuthBadUserError, AuthDunnoUserError, AuthService}
import kanjiReader.kanjiUsers.UserRepo
import zio._
import zio.http.Header.Authorization.Bearer
import zio.http._
import zio.json.{DecoderOps, EncoderOps}

object LevelRoutes {

  def apply(): Routes[Random & LevelService & UserRepo & AuthService & Client, Response] =
    Routes(
      Method.GET / "getQuests" -> handler { (req: Request) =>
//        for {
//
//          bodyString <- req.body.asString
//            .mapError(e => Response.badRequest(s"Invalid json: $e"))
//
//          id <- ZIO.fromEither(bodyString.fromJson[Long])
//            .mapError(e => Response.badRequest(s"Invalid number: $e"))
//
//          quests <- LevelService.getQuests(id)
//            .mapError(e => Response.badRequest(s"LevelService Error: $e"))
//
//          printable = quests.map(QuestHandler.toPrintable)
//
//        } yield Response.json(printable.toJson)
        req.header(Header.Authorization) match {

          case Some(Bearer(token)) =>
            (for {
              service <- ZIO.service[AuthService]

              user <- service.getUserGitData(Bearer(token))

              quests <- LevelService
                .getQuests(user.id)
                .mapError(e => Response.badRequest(s"LevelService Error: $e"))
              printable = quests.map(QuestHandler.toPrintable)

            } yield Response.json(printable.toJson))
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
      },

      Method.POST / "checkResult" -> handler { (req: Request) =>

        req.header(Header.Authorization) match {

          case Some(Bearer(token)) =>
            (for {
              service <- ZIO.service[AuthService]

              user <- service.getUserGitData(Bearer(token))

              bodyString <- req.body.asString
                .mapError(_ => Response.badRequest("Empty request body"))

              gameResult <- ZIO.fromEither(bodyString.fromJson[WordGameResult])
                .mapError(e => Response.badRequest(s"Invalid game result: $e"))

//              gameResult <- req.body.as[WordGameResult]
//                .mapError(e => Response.badRequest(s"Invalid JSON: ${e.getMessage}"))

              _ <- Console.printLine(gameResult)

              isChanged <- LevelService.checkResult(user.id, gameResult)

              _ <- Console.printLine(isChanged)


            } yield Response.json(isChanged.toJson))
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
      },

      Method.GET / "refill" -> handler { (req: Request) =>

        req.header(Header.Authorization) match {

          case Some(Bearer(token)) =>
            (for {
              service <- ZIO.service[AuthService]


              user <- service.getUserGitData(Bearer(token))

              quests <- LevelService.refillQuests(user.id)
                .mapError(e => Response.badRequest("wrong id"))

//              _ <- Console.printLine(quests)
//              _ <- Console.printLine("AAGHGAG2")


            } yield Response.ok)
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

    )

}
