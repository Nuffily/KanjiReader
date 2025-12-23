package kanjiReader.leveling

import kanjiReader.kanjiUsers.UserRepo
import zio._
import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

import java.time.LocalDateTime

case class Quest(

    user_id: Long,
    quest_type: Byte,
    word_list: Byte,
    progress: Byte = 0,
    parameter: Byte = 0,
    parameter2: Byte = 0,
    entry_id: Long = 0L,
    is_complete: Boolean = false

)

case class PrintableQuest(
    questType: String,
    description: String,
    current: Int,
    progress: Int,
    wordList: Int,
    isCompleted: Boolean
                         )

object PrintableQuest {
  implicit val encoder: JsonEncoder[PrintableQuest] =
    DeriveJsonEncoder.gen[PrintableQuest]
  implicit val decoder: JsonDecoder[PrintableQuest] =
    DeriveJsonDecoder.gen[PrintableQuest]
}

trait LevelError {
  val message: String
}

case class NoSuchUser(message: String) extends LevelError
case class SomeLevelError(message: String) extends LevelError
case class DBLevelError(message: String) extends LevelError

object QuestType extends Enumeration {
  val CorrectPer1M, CorrectPer2M, PercentIn1M, PercentIn2M, InRow1M, InRow2M,
      SumCorrect = Value
}

case class WordGameResult(
    wordList: Int,
//    questType: Int,
    time: Int,
    count: Int,
    correctCount: Int,
    maxInRow: Int
)

object WordGameResult {
  implicit val decoder: JsonDecoder[WordGameResult] = DeriveJsonDecoder.gen[WordGameResult]
  implicit val encoder: JsonEncoder[WordGameResult] = DeriveJsonEncoder.gen[WordGameResult]
}

trait LevelService {

  def handleQuest(id: Long, quest: Quest, res: WordGameResult): ZIO[UserRepo, LevelError, Boolean]

  def refillQuests(id: Long): ZIO[UserRepo & Random, LevelError, List[Quest]]

  def addExperience(id: Long, exp: Int): ZIO[UserRepo, LevelError, Boolean]

  def getQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]]

  def checkResult(
      id: Long,
      res: WordGameResult
  ): ZIO[UserRepo, LevelError, Boolean]

  def markComplete(id: Long, quest: Long): ZIO[UserRepo, LevelError, Boolean]
}


object LevelService {
  def handleQuest(id: Long, quest: Quest, res: WordGameResult): ZIO[UserRepo & LevelService, LevelError, Boolean]
= ZIO.serviceWithZIO[LevelService](_.handleQuest(id, quest, res))

  def refillQuests(id: Long): ZIO[UserRepo & Random & LevelService, LevelError, List[Quest]]
  = ZIO.serviceWithZIO[LevelService](_.refillQuests(id))

  def addExperience(id: Long, exp: Int): ZIO[UserRepo & LevelService, LevelError, Boolean]
  = ZIO.serviceWithZIO[LevelService](_.addExperience(id, exp))

  def getQuests(id: Long): ZIO[UserRepo & LevelService, LevelError, List[Quest]]
  = ZIO.serviceWithZIO[LevelService](_.getQuests(id))

  def checkResult(
                   id: Long,
                   res: WordGameResult
                 ): ZIO[UserRepo & LevelService, LevelError, Boolean]
  = ZIO.serviceWithZIO[LevelService](_.checkResult(id, res))

  def markComplete(id: Long, quest: Long): ZIO[UserRepo & LevelService, LevelError, Boolean]
  = ZIO.serviceWithZIO[LevelService](_.markComplete(id, quest))

}
