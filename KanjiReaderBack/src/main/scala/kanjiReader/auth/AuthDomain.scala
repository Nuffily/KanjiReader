package kanjiReader.auth

import kanjiReader.kanjiUsers.UserTable
import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

import java.time.LocalDateTime

/** Представление токена, которое получается от API GitHub
  */
case class AccessTokenResponse(
    access_token: String,
    token_type: String,
    scope: String
)

object AccessTokenResponse {
  implicit val decoder: JsonDecoder[AccessTokenResponse] =
    DeriveJsonDecoder.gen[AccessTokenResponse]
  implicit val encoder: JsonEncoder[AccessTokenResponse] =
    DeriveJsonEncoder.gen[AccessTokenResponse]
}

/** Представление пользователя, которое получается от API GitHub
  */
case class GitHubUser(
    login: String,
    id: Long,
    avatar_url: String
)

object GitHubUser {
  implicit val decoder: JsonDecoder[GitHubUser] =
    DeriveJsonDecoder.gen[GitHubUser]
  implicit val encoder: JsonEncoder[GitHubUser] =
    DeriveJsonEncoder.gen[GitHubUser]
}

sealed trait AuthTokenError { val message: String }

case class AuthBadToken(message: String)        extends AuthTokenError
case class AuthDunnoTokenError(message: String) extends AuthTokenError

trait AuthUserDataError { val message: String }

case class AuthBadUserError(message: String)   extends AuthUserDataError
case class AuthDunnoUserError(message: String) extends AuthUserDataError

case class GitHubError(
    error: String,
    error_description: String
)

object GitHubError {
  implicit val decoder: JsonDecoder[GitHubError] =
    DeriveJsonDecoder.gen[GitHubError]
  implicit val encoder: JsonEncoder[GitHubError] =
    DeriveJsonEncoder.gen[GitHubError]
}

/** Представление пользователя с данными для фронта
  * @param login
  *   ник с гитхаба
  * @param id
  *   айдина гитхабе
  * @param avatar_url
  *   url аватарки с гитхаба
  * @param experience
  *   опыт пользователя
  * @param refill
  *   дата обновления квестов
  */
case class KanjiUser(
    login: String,
    id: Long,
    avatar_url: String,
    experience: Int,
    refill: LocalDateTime
)

object KanjiUser {

  /** Собирает KanjiUser из нужных данных из GitHubUser и UserTable
    */
  def apply(gitHubUser: GitHubUser, userTable: UserTable): KanjiUser =
    KanjiUser(
      gitHubUser.login,
      gitHubUser.id,
      gitHubUser.avatar_url,
      userTable.experience,
      userTable.refill
    )

  implicit val decoder: JsonDecoder[KanjiUser] =
    DeriveJsonDecoder.gen[KanjiUser]
  implicit val encoder: JsonEncoder[KanjiUser] =
    DeriveJsonEncoder.gen[KanjiUser]
}
