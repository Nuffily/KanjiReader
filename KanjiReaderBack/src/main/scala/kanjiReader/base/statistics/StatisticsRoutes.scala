package kanjiReader.base.statistics

import kanjiReader.base.auth.GitHubUser
import zio.http.{Method, Request, Response, Routes, handler}
import zio.json.EncoderOps
import zio.{&, Console, ZIO}

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
          user  <- ZIO.service[GitHubUser] // Достаем юзера из R
          _ <- Console.printLine(user).orDie
          stats <- StatisticsService.get(user.id)
          _ <- Console.printLine(stats).orDie
        } yield Response.json(stats.toJson))
          .catchAll { e: StatError =>
            ZIO.succeed(Response.badRequest(s"StatError: ${e.getMessage}"))
          }
      }
    )
}