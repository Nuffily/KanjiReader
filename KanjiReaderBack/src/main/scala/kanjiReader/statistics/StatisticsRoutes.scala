package kanjiReader.statistics

import kanjiReader.KanjiResponse

import kanjiReader.auth.{AuthBadUserError, AuthDunnoUserError, AuthService}
import kanjiReader.kanjiUsers.UserRepo
import zio._
import zio.http.Header.Authorization.Bearer
import zio.http._
import zio.json.EncoderOps

object StatisticsRoutes {
  def apply()
      : Routes[StatisticsService & UserRepo & AuthService & Client, Response] =
    Routes(
      Method.GET / "getStats" -> handler { (req: Request) =>
        req.header(Header.Authorization) match {

          case Some(Bearer(token)) =>
            (for {
              service <- ZIO.service[AuthService]

              user <- service.getUserGitData(Bearer(token))

              stats <- StatisticsService.get(user.id)

            } yield Response.json(stats.toJson))
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
