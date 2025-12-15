package kanjiReader.kanjiUsers

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}
import zio.schema.{DeriveSchema, Schema}

import java.time.LocalDateTime

case class User(
    id: Int,
    level: Byte,
    experience: Int,
    refill: LocalDateTime
)

object User {
  implicit val schema: Schema[User] =
    DeriveSchema.gen[User]

  implicit val decoder: JsonDecoder[User] =
    DeriveJsonDecoder.gen[User]
  implicit val encoder: JsonEncoder[User] =
    DeriveJsonEncoder.gen[User]
}
