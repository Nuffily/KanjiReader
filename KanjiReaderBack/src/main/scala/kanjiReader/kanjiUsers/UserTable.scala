package kanjiReader.kanjiUsers

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}
import zio.schema.{DeriveSchema, Schema}

import java.time.LocalDateTime

case class UserTable(
    id: Long,
    experience: Int,
    refill: LocalDateTime
)

object UserTable {

  implicit val schema: Schema[UserTable] =
    DeriveSchema.gen[UserTable]

  implicit val encoder: JsonEncoder[UserTable] =
    DeriveJsonEncoder.gen[UserTable]
  implicit val decoder: JsonDecoder[UserTable] =
    DeriveJsonDecoder.gen[UserTable]
}
