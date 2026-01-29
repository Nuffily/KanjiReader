package kanjiReader.leveling

import kanjiReader.kanjiUsers.UserRepo
import kanjiReader.statistics.StatisticsService
import zio._

trait LevelService {

  /** Принимает на вход квест и результат игры, меняет состояние квеста в БД,
    * если нужно Возвращает True, если что-то изменилось
    */
  def handleQuest(
      id: Long,
      quest: Quest,
      res: WordGameResult
  ): ZIO[UserRepo, LevelError, Boolean]

  /** Обновляет квесты для пользователя и возвращает их
    */
  def refillQuests(id: Long): ZIO[UserRepo & Random, LevelError, List[Quest]]

  /** Увеличивает опыт пользователя на [exp] единиц
    */
  def addExperience(id: Long, exp: Int): ZIO[UserRepo, LevelError, Boolean]

  /** Возвращает список квестов пользователя
    */
  def getQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]]

  /** Обрабатывает результат игры пользователя:
    * ```
    * 1. Обновляет состояние квестов
    * 2. Изменяет статистику
    * ```
    */
  def checkResult(
      id: Long,
      res: WordGameResult
  ): ZIO[UserRepo & StatisticsService, LevelError, Boolean]

}

object LevelService {

  /** Принимает на вход квест и результат игры, меняет состояние квеста в БД,
    * если нужно Возвращает True, если что-то изменилось
    */
  def handleQuest(
      id: Long,
      quest: Quest,
      res: WordGameResult
  ): ZIO[UserRepo & LevelService, LevelError, Boolean] =
    ZIO.serviceWithZIO[LevelService](_.handleQuest(id, quest, res))

  /** Обновляет квесты для пользователя и возвращает их
    */
  def refillQuests(
      id: Long
  ): ZIO[UserRepo & Random & LevelService, LevelError, List[Quest]] =
    ZIO.serviceWithZIO[LevelService](_.refillQuests(id))

  /** Увеличивает опыт пользователя на [exp] единиц
    */
  def addExperience(
      id: Long,
      exp: Int
  ): ZIO[UserRepo & LevelService, LevelError, Boolean] =
    ZIO.serviceWithZIO[LevelService](_.addExperience(id, exp))

  /** Возвращает список квестов пользователя
    */
  def getQuests(
      id: Long
  ): ZIO[UserRepo & LevelService, LevelError, List[Quest]] =
    ZIO.serviceWithZIO[LevelService](_.getQuests(id))

  /** Обрабатывает результат игры пользователя:
    * ```
    * 1. Обновляет состояние квестов
    * 2. Изменяет статистику
    * ```
    */
  def checkResult(
      id: Long,
      res: WordGameResult
  ): ZIO[UserRepo & LevelService & StatisticsService, LevelError, Boolean] =
    ZIO.serviceWithZIO[LevelService](_.checkResult(id, res))
}
