package kanjiReader.kanjiUsers

import io.getquill.jdbczio.Quill
import io.getquill.{Escape, H2ZioJdbcContext}
import zio._

import javax.sql.DataSource

case class PersistentUserRepo(ds: DataSource) extends UserRepo {
  val ctx = new H2ZioJdbcContext(Escape)

  import ctx._

  override def register(id: Int): Task[Boolean] = {
    for {
      existing <- ctx
        .run {
          quote {
            query[UserTable].filter(_.id == lift(id))
          }
        }
        .provide(ZLayer.succeed(ds))

      result <-
        if (existing.nonEmpty) {
          ZIO.succeed(false)
        } else {
          for {
            date <- Clock.localDateTime
            _ <- ctx
              .run {
                quote {
                  query[UserTable].insertValue {
                    lift(UserTable(id, 0, date))
                  }
                }
              }
              .provide(ZLayer.succeed(ds))
          } yield true
        }

    } yield result
  }

  override def lookupId(id: Int): Task[Option[UserTable]] =
    ctx
      .run {
        quote {
          query[UserTable]
            .filter(p => p.id == lift(id))
        }
      }
      .provide(ZLayer.succeed(ds))
      .map(_.headOption)

//  def lookupToken(token: String): Task[Option[UserTable]] =
//    ctx
//      .run {
//        quote {
//          query[UserTable]
//            .filter(p => p.id == lift(id))
//        }
//      }
//      .provide(ZLayer.succeed(ds))
//      .map(_.headOption)

//  def addExp(id: Int, exp: Int): Task[Boolean] =
//    ctx
//      .run {
//        quote {
//          query[UserTable]
//            .filter(p => p.id == lift(id))
//            .updateValue(   )
//        }
//      }
//      .provide(ZLayer.succeed(ds))
//      .map(_.is)

}

object PersistentUserRepo {
  def layer: ZLayer[Any, Throwable, PersistentUserRepo] =
    Quill.DataSource.fromPrefix("UserApp") >>>
      ZLayer.fromFunction(PersistentUserRepo(_))
}
