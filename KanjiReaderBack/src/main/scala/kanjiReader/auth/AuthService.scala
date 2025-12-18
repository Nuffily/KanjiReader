package kanjiReader.auth

import zio.http.Client
import zio.http.Header.Authorization
import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}
import zio.{&, ZIO}

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

trait AuthService {
  def getAccessToken(
      code: String
  ): ZIO[Client, AuthTokenError, AccessTokenResponse]

  def getUserData(
      authHeader: Authorization
  ): ZIO[Client, AuthUserDataError, GitHubUser]
}

object AuthService {
  def getAccessToken(
      code: String
  ): ZIO[AuthService & Client, AuthTokenError, AccessTokenResponse] =
    ZIO.serviceWithZIO[AuthService](_.getAccessToken(code))

  def getUserData(
      authHeader: Authorization
  ): ZIO[AuthService & Client, AuthUserDataError, GitHubUser] =
    ZIO.serviceWithZIO[AuthService](_.getUserData(authHeader))
}
