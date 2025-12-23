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

        req.header(Header.Authorization) match {

          case Some(Bearer(token)) =>
            (for {
              service <- ZIO.service[AuthService]

              user <- service.getUserGitData(Bearer(token))

              quests <- LevelService
                .getQuests(user.id)
                .mapError(e => Response.badRequest(s"LevelService Error: $e"))
              printable = quests.map(KanjiQuestHandler.toPrintable)

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

              isChanged <- LevelService.checkResult(user.id, gameResult)

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

              _ <- LevelService.refillQuests(user.id)
                .mapError(e => Response.badRequest("wrong id"))

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
