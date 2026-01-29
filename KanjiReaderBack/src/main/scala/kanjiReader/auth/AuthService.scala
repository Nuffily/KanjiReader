package kanjiReader.auth

import kanjiReader.kanjiUsers.UserRepo
import zio.http.Client
import zio.http.Header.Authorization
import zio.{&, ZIO}

trait AuthService {

  /** Принимает код входа через гитхаб, и с помощью него получает токен
    * пользователя с API GitHub
    */
  def getAccessToken(
      code: String
  ): ZIO[Client, AuthTokenError, AccessTokenResponse]

  /** Принимает токен Authorization и возвращает данные пользователя с API
    * GitHub
    */
  def getUserGitData(
      authHeader: Authorization
  ): ZIO[Client, AuthUserDataError, GitHubUser]

  /** Принимает токен Authorization и возвращает данные пользователя в виде
    * KanjiUser
    */
  def getKanjiUserData(
      authHeader: Authorization
  ): ZIO[Client & UserRepo, AuthUserDataError, KanjiUser]
}

object AuthService {

  /** Принимает код входа через гитхаб, и с помощью него получает токен
    * пользователя с API GitHub
    */
  def getAccessToken(
      code: String
  ): ZIO[AuthService & Client, AuthTokenError, AccessTokenResponse] =
    ZIO.serviceWithZIO[AuthService](_.getAccessToken(code))

  /** Принимает токен Authorization и возвращает данные пользователя с API
    * GitHub
    */
  def getUserGitData(
      authHeader: Authorization
  ): ZIO[AuthService & Client, AuthUserDataError, GitHubUser] =
    ZIO.serviceWithZIO[AuthService](_.getUserGitData(authHeader))

  /** Принимает токен Authorization и возвращает данные пользователя в виде
    * KanjiUser
    */
  def getKanjiUserData(
      authHeader: Authorization
  ): ZIO[Client & UserRepo & AuthService, AuthUserDataError, KanjiUser] =
    ZIO.serviceWithZIO[AuthService](_.getKanjiUserData(authHeader))
}
