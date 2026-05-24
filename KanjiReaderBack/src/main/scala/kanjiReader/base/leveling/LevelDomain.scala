package kanjiReader.base.leveling

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

/** Класс внутреннего представления квеста */
case class Quest(
                  user_id: Long,
                  quest_type: Byte,
                  word_list: Byte,
                  progress: Byte = 0,
                  parameter: Byte = 0,
                  parameter2: Byte = 0,
                  entry_id: Long = 0L,
                  is_complete: Boolean = false
                ) {
  override def toString: String = {
    // Безопасно сопоставляем Byte с именами из QuestType
    val typeName = scala.util.Try(QuestType(quest_type.toInt).toString).getOrElse(s"Unknown($quest_type)")
    val status = if (is_complete) "❌ [COMPLETE]" else "⏳ [IN PROGRESS]"

    s"Quest #$entry_id $status\n" +
      s"  User ID:    $user_id\n" +
      s"  Type:       $typeName\n" +
      s"  Word List:  #$word_list\n" +
      s"  Progress:   $progress\n" +
      s"  Params:     (param1: $parameter, param2: $parameter2)"
  }
}

trait LevelError extends Throwable {
  val message: String
  override def getMessage: String = message
}

case class NoSuchUser(message: String)     extends LevelError
case class SomeLevelError(message: String) extends LevelError
case class DBLevelError(message: String)   extends LevelError

object QuestType extends Enumeration {
  val CorrectPer1M, CorrectPer2M, Percent, InRow1M, InRow2M, SumCorrect = Value
}

/** Представление результата игры, который приходит с фронта */
case class WordGameResult(
                           wordList: Byte,
                           time: Int,
                           count: Int,
                           correctCount: Int,
                           maxInRow: Int
                         ) {
  override def toString: String = {
    val accuracy = if (count > 0) s"${(correctCount.toDouble / count * 100).round}%" else "0%"

    s"WordGameResult(\n" +
      s"  wordList     = #$wordList,\n" +
      s"  time         = ${time}m,\n" +
      s"  totalCount   = $count,\n" +
      s"  correctCount = $correctCount ($accuracy),\n" +
      s"  maxInRow     = $maxInRow\n" +
      s")"
  }
}

object WordGameResult {
  implicit val decoder: JsonDecoder[WordGameResult] =
    DeriveJsonDecoder.gen[WordGameResult]
  implicit val encoder: JsonEncoder[WordGameResult] =
    DeriveJsonEncoder.gen[WordGameResult]
}