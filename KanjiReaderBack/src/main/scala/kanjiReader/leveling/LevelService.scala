package kanjiReader.leveling

import kanjiReader.kanjiUsers.UserRepo
import zio._

trait LevelService {

  def handleQuest(
      id: Long,
      quest: Quest,
      res: WordGameResult
  ): ZIO[UserRepo, LevelError, Boolean]

  def refillQuests(id: Long): ZIO[UserRepo & Random, LevelError, List[Quest]]

  def addExperience(id: Long, exp: Int): ZIO[UserRepo, LevelError, Boolean]

  def getQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]]

  def checkResult(
      id: Long,
      res: WordGameResult
  ): ZIO[UserRepo, LevelError, Boolean]

}

object LevelService {
  def handleQuest(
      id: Long,
      quest: Quest,
      res: WordGameResult
  ): ZIO[UserRepo & LevelService, LevelError, Boolean] =
    ZIO.serviceWithZIO[LevelService](_.handleQuest(id, quest, res))

  def refillQuests(
      id: Long
  ): ZIO[UserRepo & Random & LevelService, LevelError, List[Quest]] =
    ZIO.serviceWithZIO[LevelService](_.refillQuests(id))

  def addExperience(
      id: Long,
      exp: Int
  ): ZIO[UserRepo & LevelService, LevelError, Boolean] =
    ZIO.serviceWithZIO[LevelService](_.addExperience(id, exp))

  def getQuests(
      id: Long
  ): ZIO[UserRepo & LevelService, LevelError, List[Quest]] =
    ZIO.serviceWithZIO[LevelService](_.getQuests(id))

  def checkResult(
      id: Long,
      res: WordGameResult
  ): ZIO[UserRepo & LevelService, LevelError, Boolean] =
    ZIO.serviceWithZIO[LevelService](_.checkResult(id, res))
}
