package kanjiReader.kanjiUsers

import io.getquill.jdbczio.Quill
import io.getquill.{Escape, H2ZioJdbcContext}
import zio._

import javax.sql.DataSource

case class PersistentUserRepo(ds: DataSource) extends UserRepo {
  val ctx = new H2ZioJdbcContext(Escape)

  import ctx._

  override def register(id: Long): IO[UserError, Boolean] = {
    for {
      existing <- ctx
        .run {
          quote {
            query[UserTable].filter(_.id == lift(id))
          }
        }
        .provide(ZLayer.succeed(ds))
        .mapError(e => DBUserError(e.getMessage))

      result <-
        if (existing.nonEmpty) {
          ZIO.succeed(false)
        } else {
          for {
            now <- Clock.localDateTime

            _ <- ctx
              .run {
                quote {
                  query[UserTable].insertValue {
                    lift(UserTable(id, 0, now))
                  }
                }
              }
              .provide(ZLayer.succeed(ds))
              .mapError(e => DBUserError(e.getMessage))

          } yield true
        }

    } yield result
  }

  override def lookupId(id: Long): IO[UserError, Option[UserTable]] =
    ctx
      .run {
        quote {
          query[UserTable]
            .filter(p => p.id == lift(id))
        }
      }
      .provide(ZLayer.succeed(ds))
      .map(_.headOption)
      .mapError(e => DBUserError(e.getMessage))

  override def lookupOrRegister(id: Long): IO[UserError, UserTable] = {
    for {
      maybeUser <- lookupId(id)
      user <- maybeUser match {
        case Some(user) =>
          ZIO.succeed(user)

        case None =>
          register(id).flatMap { success =>
            if (success) {

              lookupId(id).flatMap {
                case Some(user) => ZIO.succeed(user)
                case None =>
                  ZIO.fail(
                    DBUserError(s"User $id not found after registration")
                  )
              }
            } else {

              lookupId(id).flatMap {
                case Some(user) => ZIO.succeed(user)
                case None =>
                  ZIO.fail(
                    DBUserError(
                      s"User $id disappeared after registration attempt"
                    )
                  )

              }
            }
          }
      }
    } yield user
  }

  override def refill(id: Long): IO[UserError, Boolean] = for {
    now <- Clock.localDateTime
    elapseTime = now.plusHours(4)

    updated <- ctx
      .run {
        query[UserTable]
          .filter(_.id == lift(id))
          .update(_.refill -> lift(elapseTime))
      }
      .provide(ZLayer.succeed(ds))
      .mapError(e => DBUserError(e.getMessage))
  } yield updated > 0

  override def addExp(id: Long, exp: Int): IO[UserError, Boolean] = for {

    updated <- ctx
      .run {
        query[UserTable]
          .filter(_.id == lift(id))
          .update(u => u.experience -> (u.experience + lift(exp)))
      }
      .provide(ZLayer.succeed(ds))
      .mapError(e => OtherUserError(e.getMessage))
  } yield updated > 0

}

object PersistentUserRepo {
  def layer: ZLayer[Any, Throwable, PersistentUserRepo] =
    Quill.DataSource.fromPrefix("UserApp") >>>
      ZLayer.fromFunction(PersistentUserRepo(_))
}
