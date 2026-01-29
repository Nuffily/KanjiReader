package kanjiReader.statistics

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

/**
 * Нужна для представления результата одной игры (количество ответов / правильных)
 * @param id id пользователя
 * @param attempt номер попытки
 * @param correct количество правильных ответов
 * @param number количество ответов
 * @param word_list номер wordList
 */
case class Statistic(
    id: Long,
    attempt: Int,
    correct: Int,
    number: Int,
    word_list: Byte
)

trait StatError { val message: String }

case class DBStatError(message: String) extends StatError

object Statistic {
  implicit val decoder: JsonDecoder[Statistic] =
    DeriveJsonDecoder.gen[Statistic]
  implicit val encoder: JsonEncoder[Statistic] =
    DeriveJsonEncoder.gen[Statistic]
}
