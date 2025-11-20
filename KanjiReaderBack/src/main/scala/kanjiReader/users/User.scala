package kanjiReader.users

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}
import zio.schema.{DeriveSchema, Schema}

case class User(login: String, password: String)

object User {
  implicit val schema: Schema[User] =
    DeriveSchema.gen[User]
}

