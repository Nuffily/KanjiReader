package kanjiReader.leveling

import kanjiReader.kanjiUsers.UserRepo
import zio._

case class Quest(
    entry_id: Long,
    user_id: Long,
    quest_id: Byte,
    word_list: Byte,
    progress: Byte,
    is_complete: Boolean
)

trait LevelError {
  val message: String
}

object QuestType extends Enumeration {
  val CorrectPer1M, CorrectPer2, PercentIn1M, PercentIn2M, InRow1M, InRow2M,
      SumCorrect = Value
}

case class WordGameResult(
    wordList: Int,
    questType: Int,
    time: Duration,
    count: Int,
    correctCount: Int
)

trait LevelService {

  def handleQuest(id: Long, quest: Quest, res: WordGameResult): ZIO[UserRepo, LevelError, List[Quest]]

  def createQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]]

  def addExperience(id: Long): ZIO[UserRepo, LevelError, Boolean]

  def getQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]]

  def checkResult(
      id: Long,
      res: WordGameResult
  ): ZIO[UserRepo, LevelError, Boolean]

  def markComplete(id: Long, quest: Long): ZIO[UserRepo, LevelError, Boolean]
}
