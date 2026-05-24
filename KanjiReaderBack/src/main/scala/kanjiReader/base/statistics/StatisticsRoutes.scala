package kanjiReader.base.statistics

import kanjiReader.base.auth.GitHubUser
import zio.http.{Method, Request, Response, Routes, handler}
import zio.json.EncoderOps
import zio.{&, ZIO}

object StatisticsRoutes {
  def apply(): Routes[StatisticsService & GitHubUser, Response] =
    Routes(
      /** Возвращает статистику User по токену.
       *
       * Возвращает статистику пользователя [id] как список, где каждое
       * значение - процент верных ответов за последние пять попыток в
       * соответствующем wordList
       */
      Method.GET / "getStats" -> handler { (req: Request) =>
        (for {
          user  <- ZIO.service[GitHubUser]
          stats <- StatisticsService.get(user.id)
        } yield Response.json(stats.toJson))
          .catchAll { e: StatError =>
            ZIO.succeed(Response.badRequest(s"StatError: ${e.getMessage}"))
          }
      }
    )
}