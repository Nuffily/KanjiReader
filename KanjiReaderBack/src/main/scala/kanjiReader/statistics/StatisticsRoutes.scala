package kanjiReader.statistics

import kanjiReader.auth.AuthService
import kanjiReader.kanjiUsers.UserRepo
import kanjiReader.utils.KanjiResponse
import zio.http.{Client, Method, Request, Response, Routes, handler}
import zio.json.EncoderOps
import zio.{&, ZIO}

object StatisticsRoutes {
  def apply()
      : Routes[StatisticsService & UserRepo & AuthService & Client, Response] =
    Routes(
      /** Возвращает статистику User по токену.
        *
        * Возвращает статистику пользователя [id] как список, где каждое
        * значение - процент верных ответов за последние пять попыток в
        * соответствующем wordList
        */
      Method.GET / "getStats" -> handler { (req: Request) =>
        KanjiResponse
          .withToken(req) { token =>
            for {
              user <- ZIO
                .serviceWithZIO[AuthService](_.getUserGitData(token))
                .mapError(KanjiResponse.handleAuthError)
              stats <- StatisticsService.get(user.id)
            } yield Response.json(stats.toJson)
          }
          .catchAll {
            case r: Response => ZIO.succeed(r)
            case e: StatError =>
              ZIO.succeed(Response.badRequest(s"StatError: ${e.getMessage}"))
          }
      }
    )
}
