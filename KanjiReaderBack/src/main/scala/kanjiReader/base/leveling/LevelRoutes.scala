package kanjiReader.base.leveling

import kanjiReader.base.auth.AuthService
import kanjiReader.base.kanjiUsers.UserRepo
import kanjiReader.base.leveling.handler.KanjiQuestHandler
import kanjiReader.base.statistics.StatisticsService
import kanjiReader.utils.KanjiResponse
import zio.http.{Client, Method, Request, Response, Routes, handler}
import zio.json.{DecoderOps, EncoderOps}
import zio.{&, Random, ZIO}

object LevelRoutes {

  def apply(): Routes[
    Random & LevelService & UserRepo & AuthService & Client & StatisticsService,
    Response
  ] =
    Routes(
      /** Возвращает список квестов пользователя, где кадлый квест состоит из:
        * ```
        * user_id - пользователь
        * quest_type - тип квеста (см. QuestType)
        * word_list - список слов, в котором квест действует
        * progress - прогресс квеста (если есть)
        * parameter - параметр 1 (зависит от типа)
        * parameter2 - параметр 2 (зависит от типа)
        * entry_id - суррогатный ключ
        * is_complete - пройден ли квест
        * ```
        */
      Method.GET / "getQuests" -> handler { (req: Request) =>
        KanjiResponse
          .withToken(req) { token =>
            for {
              user <- ZIO
                .serviceWithZIO[AuthService](_.getUserGitData(token))
                .mapError(KanjiResponse.handleAuthError)
              quests <- LevelService.getQuests(user.id)
              printable = quests.map(KanjiQuestHandler.toPrintable)
            } yield Response.json(printable.toJson)
          }
          .catchAll(handleLevelError)
      },

      /** Обрабатывает результат игры пользователя:
        * ```
        * 1. Обновляет состояние квестов
        * 2. Изменяет статистику
        * ```
        * Принимает на вход объект типа:
        * ```
        * wordList - список слов, в котором прошла игра
        * time - выбранное время
        * count - количество ответов
        * correctCount - количество верных ответов
        * maxInRow - максимальное количество верных ответов подряд
        * ```
        */
      Method.POST / "checkResult" -> handler { (req: Request) =>
        KanjiResponse
          .withToken(req) { token =>
            for {
              user <- ZIO
                .serviceWithZIO[AuthService](_.getUserGitData(token))
                .mapError(KanjiResponse.handleAuthError)
              bodyString <- req.body.asString
                .orElseFail(Response.badRequest("Empty body"))
              gameResult <- ZIO
                .fromEither(bodyString.fromJson[WordGameResult])
                .orElseFail(Response.badRequest("Invalid JSON"))
              isChanged <- LevelService.checkResult(user.id, gameResult)
            } yield Response.json(isChanged.toJson)
          }
          .catchAll(handleLevelError)
      },

      // Unused
      Method.GET / "refill" -> handler { (req: Request) =>
        KanjiResponse
          .withToken(req) { token =>
            for {
              user <- ZIO
                .serviceWithZIO[AuthService](_.getUserGitData(token))
                .mapError(KanjiResponse.handleAuthError)
              _ <- LevelService
                .refillQuests(user.id)
                .mapError(e => Response.badRequest(s"wrong id: $e"))
            } yield Response.ok
          }
          .catchAll(handleLevelError)
      }
    )

  private val handleLevelError: Any => ZIO[Any, Nothing, Response] = {
    case r: Response => ZIO.succeed(r)

    case SomeLevelError(message) =>
      ZIO.succeed(Response.badRequest(s"No such user: $message"))
    case NoSuchUser(message) =>
      ZIO.succeed(Response.badRequest(s"No such user: $message"))
    case DBLevelError(message) =>
      ZIO.logError(s"DBLevel error: $message") *>
        ZIO.succeed(Response.internalServerError(s"Database error: $message"))

    case _ => ZIO.succeed(Response.internalServerError(s"Unknown error"))
  }
}
