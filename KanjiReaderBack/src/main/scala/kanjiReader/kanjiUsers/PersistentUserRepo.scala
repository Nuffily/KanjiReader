package kanjiReader.kanjiUsers

import io.getquill.context.ZioJdbc.DataSourceLayer
import io.getquill.{Escape, H2ZioJdbcContext}
import zio._
import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

import java.time.LocalDateTime
import java.util.UUID
import javax.sql.DataSource

case class UserTable(
    id: Int,
    level: Byte,
    experience: Int,
    refill: LocalDateTime
)

object UserTable {
  implicit val encoder: JsonEncoder[UserTable] =
    DeriveJsonEncoder.gen[UserTable]
  implicit val decoder: JsonDecoder[UserTable] =
    DeriveJsonDecoder.gen[UserTable]
}

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
                    lift(UserTable(id, 0, 0, date))
                  }
                }
              }
              .provide(ZLayer.succeed(ds))
          } yield true
        }

    } yield result
  }


  override def lookup(id: Int): Task[Option[UserTable]] =
    ctx
      .run {
        quote {
          query[UserTable]
            .filter(p => p.id == lift(id))
        }
      }
      .provide(ZLayer.succeed(ds))
      .map(_.headOption)

}

object PersistentUserRepo {
  def layer: ZLayer[Any, Throwable, PersistentUserRepo] =
    DataSourceLayer.fromPrefix("UserApp") >>>
      ZLayer.fromFunction(PersistentUserRepo(_))
}
