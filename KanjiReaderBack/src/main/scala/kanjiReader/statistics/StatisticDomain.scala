package kanjiReader.statistics

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

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
