package kanjiReader.leveling

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

/** Класс внутреннего представления квеста
  * @param user_id
  *   пользователь
  * @param quest_type
  *   тип квеста (см. QuestType)
  * @param word_list
  *   список слов, в котором квест действует
  * @param progress
  *   прогресс квеста (если есть)
  * @param parameter
  *   параметр 1 (зависит от типа)
  * @param parameter2
  *   параметр 2 (зависит от типа)
  * @param entry_id
  *   суррогатный ключ
  * @param is_complete
  *   пройден ли квест
  */
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

/** Нужен для представления кветста на фронте
  * @param questType
  *   тип квеста (для иконки)
  * @param description
  *   описание квеста
  * @param current
  *   прогресс квеста
  * @param progress
  *   максимальный прогресс (для прогресс бара)
  * @param wordList
  *   список слов квеста
  * @param isCompleted
  *   пройден ли квест
  */
case class PrintableQuest(
    questType: String,
    description: String,
    current: Int,
    progress: Int,
    wordList: Int,
    time: Int,
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

/** Представление резальтата игры, который приходит с фронта
  * @param wordList
  *   список слов, в котором прошла игра
  * @param time
  *   выбранное время
  * @param count
  *   количество ответов
  * @param correctCount
  *   количество верных ответов
  * @param maxInRow
  *   максимальное количество верных ответов подряд
  */
case class WordGameResult(
    wordList: Byte,
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
