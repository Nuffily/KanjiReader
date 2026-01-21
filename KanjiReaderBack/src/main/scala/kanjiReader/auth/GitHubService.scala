package kanjiReader.auth

import kanjiReader.KanjiStructures.KanjiCache
import kanjiReader.config.GitHubConfig
import kanjiReader.kanjiUsers.UserRepo
import zio.http.Header.Authorization
import zio.http._
import zio.json.DecoderOps
import zio.{&, Scope, ZIO, ZLayer, durationInt, _}

case class GitHubService(
    config: GitHubConfig,
    cache: KanjiCache[Authorization, GitHubUser]
) extends AuthService {

  private lazy val tokenURL = URL
    .decode(config.gitHubTokenServer)
    .getOrElse(
      throw new IllegalArgumentException("Wrong url for token")
    )

  private lazy val userURL = URL
    .decode(config.gitHubUserServer)
    .getOrElse(
      throw new IllegalArgumentException("Wrong url for user service")
    )

  override def getAccessToken(
      code: String
  ): ZIO[Client, AuthTokenError, AccessTokenResponse] =
    ZIO.scoped {
      for {
        client <- ZIO.service[Client]

        formBody = Body.fromURLEncodedForm(
          Form.fromStrings(
            "client_id"     -> config.clientId,
            "client_secret" -> config.clientSecret,
            "code"          -> code
          )
        )

        request = Request
          .post(tokenURL, formBody)
          .addHeader(Header.Accept(MediaType.application.json))

        response <- client
          .request(request)
          .mapError(e =>
            AuthDunnoTokenError(s"Request failed: ${e.getMessage}")
          )

        _ <-
          if (response.status.isSuccess) ZIO.unit
          else
            response.body.asString
              .flatMap(body =>
                ZIO.fail(
                  AuthDunnoTokenError(s"HTTP ${response.status.code}: $body")
                )
              )
              .mapError(e => AuthDunnoTokenError(e.toString))

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

  override def getUserGitData(
      authHeader: Authorization
  ): ZIO[Client, AuthUserDataError, GitHubUser] = ZIO.scoped {

    cache.getOrElseZIO(authHeader)(
      Console.printLine("Non hit!").ignore *> requestUserData(authHeader)
    )
  }

  override def getKanjiUserData(
      authHeader: Authorization
  ): ZIO[Client & UserRepo, AuthUserDataError, KanjiUser] = for {

    gitUser <- getUserGitData(authHeader)

    user <- UserRepo
      .lookupOrRegister(gitUser.id)
      .mapError(e => AuthDunnoUserError(e.message))

  } yield KanjiUser(gitUser, user)

  private def requestUserData(
      authHeader: Authorization
  ): ZIO[Client & Scope, AuthUserDataError, GitHubUser] =
    ZIO.scoped {
      for {
        client <- ZIO.service[Client]

        request = Request
          .get(userURL)
          .addHeader(authHeader)
          .addHeader(Header.Accept(MediaType.application.json))

        response <- client
          .request(request)
          .mapError(e => AuthDunnoUserError(s"Request failed: ${e.getMessage}"))

        body <- response.body.asString
          .mapError(e =>
            AuthDunnoUserError(s"Failed to read response: ${e.getMessage}")
          )

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
  def layer: ZLayer[GitHubConfig, Throwable, AuthService] = ZLayer.scoped {
    for {
      config <- ZIO.service[GitHubConfig]
      cache  <- KanjiCache.make[Authorization, GitHubUser](1.hour)
    } yield GitHubService(config, cache)
  }
}
