package kanjiReader.leveling

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

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

case class NoSuchUser(message: String)     extends LevelError
case class SomeLevelError(message: String) extends LevelError
case class DBLevelError(message: String)   extends LevelError

object QuestType extends Enumeration {
  val CorrectPer1M, CorrectPer2M, Percent, InRow1M, InRow2M, SumCorrect = Value
}

case class WordGameResult(
    wordList: Int,
    time: Int,
    count: Int,
    correctCount: Int,
    maxInRow: Int
)

object WordGameResult {
  implicit val decoder: JsonDecoder[WordGameResult] =
    DeriveJsonDecoder.gen[WordGameResult]
  implicit val encoder: JsonEncoder[WordGameResult] =
    DeriveJsonEncoder.gen[WordGameResult]
}
