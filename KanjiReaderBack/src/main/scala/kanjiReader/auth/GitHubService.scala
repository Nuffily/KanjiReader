package kanjiReader.auth

import kanjiReader.config.GitHubConfig
import zio.http.Header.Authorization
import zio.http._
import zio.{Console, IO, ZIO, ZLayer}
//import kanjiReader.other.implicits._
//import
import zio.http.Body.ContentType
import zio.json.DecoderOps // если используете .fromJson[T]
import zio.http.{Client, Header}
import zio.http.Request
import zio.http.Response

case class GitHubService(config: GitHubConfig) extends AuthService {

  override def getAccessToken(
      code: String
  ): ZIO[Client, AuthTokenError, AccessTokenResponse] =
    ZIO.scoped {
      for {
        client <- ZIO.service[Client]

        url <- ZIO
          .fromEither(URL.decode("https://github.com/login/oauth/access_token"))
          .orElseFail(AuthDunnoTokenError("Invalid URL"))

        formBody = Body.fromURLEncodedForm(
          Form.fromStrings(
            "client_id"     -> config.clientId,
            "client_secret" -> config.clientSecret,
            "code"          -> code
          )
        )

        request = Request
          .post(url, formBody)
          .addHeader(Header.Accept(MediaType.application.json))

        response <- client
          .request(request)
          .mapError(e => AuthDunnoTokenError(s"Request failed: ${e.getMessage}"))

        _ <-
          if (response.status.isSuccess) ZIO.unit
          else
            response.body.asString
              .flatMap(body =>
                ZIO.fail(AuthDunnoTokenError(s"HTTP ${response.status.code}: $body"))
              )
              .mapError(e => AuthDunnoTokenError(s"Request failed: Dunno"))

        body <- response.body.asString
          .mapError(e =>
            AuthDunnoTokenError(s"Failed to read response: ${e.getMessage}")
          )

        _ <- ZIO
          .fromEither(body.fromJson[GitHubError].swap)
          .mapError(e => AuthBadToken(s"Failed to get token: $e"))

        tokenResponse <- ZIO
          .fromEither(body.fromJson[AccessTokenResponse])
          .mapError(e => AuthDunnoTokenError(s"Failed to parse JSON: $e"))

      } yield tokenResponse
    }

  override def getUserData(
      authHeader: Authorization
  ): ZIO[Client, AuthUserDataError, GitHubUser] =
    ZIO.scoped {

      for {
        client <- ZIO.service[Client]

        url <- ZIO
          .fromEither(
            URL.decode("https://api.github.com/user")
          )
          .orElseFail(AuthDunnoUserError("Invalid URL"))

        request = Request
          .get(url)
          .addHeader(authHeader)
          .addHeader(Header.Accept(MediaType.application.json))

        response <- client
          .request(request)
          .mapError(e => AuthDunnoUserError(s"Request failed: ${e.getMessage}"))


        body <- response.body.asString
          .mapError(e => AuthDunnoUserError(s"Failed to read response: ${e.getMessage}"))

        _ <- response.status match {
          case status if status.isSuccess =>
            ZIO.unit

          case Status.Unauthorized =>
            ZIO.fail(
              AuthBadUserError(s"GitHub token expired or invalid (401): $body")
            )

          case status =>
            ZIO.fail(
              AuthDunnoUserError(s"HTTP ${status.code}: $body")
            )
        }

        user <- ZIO
          .fromEither(body.fromJson[GitHubUser])
          .mapError(e => AuthDunnoUserError(s"Failed to parse JSON: $e"))

      } yield user
    }
}

object GitHubService {
  def layer: ZLayer[GitHubConfig, Throwable, AuthService] =
    ZLayer.fromFunction(GitHubService(_))
}
