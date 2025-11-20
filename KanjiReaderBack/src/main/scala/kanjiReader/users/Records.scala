package kanjiReader.users

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}
import zio.schema.{DeriveSchema, Schema}

case class Records (recs: List[Short])

object Records {
  implicit val schema: Schema[Records] =
    DeriveSchema.gen[Records]

  implicit val encoder: JsonEncoder[Records] = DeriveJsonEncoder.gen[Records]
  implicit val decoder: JsonDecoder[Records] = DeriveJsonDecoder.gen[Records]
}