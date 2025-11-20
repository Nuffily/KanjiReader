package kanjiReader.users

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}
import zio.schema.{DeriveSchema, Schema}

import java.util.UUID

case class UserTimeStat(
    uuid: UUID,
    `11`: Short,
    `16`: Short,
    `21`: Short,
    `26`: Short,
    `31`: Short,
    `36`: Short,
    `41`: Short,
    `46`: Short,
    `51`: Short,
    `56`: Short
)

object UserTimeStat {
  implicit val schema: Schema[UserTimeStat] =
    DeriveSchema.gen[UserTimeStat]
}

