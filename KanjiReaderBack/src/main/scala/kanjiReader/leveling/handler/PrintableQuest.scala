package kanjiReader.leveling.handler

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

/** Нужен для представления кветста на фронте
  *
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
