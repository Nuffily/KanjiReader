//package kanjiReader.users
//
//import io.getquill.context.ZioJdbc.DataSourceLayer
//import io.getquill.{Escape, H2ZioJdbcContext}
//import zio._
//import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}
//
//import java.util.UUID
//import javax.sql.DataSource
//
//case class UserTable(uuid: UUID, login: String, password: String)
//
//object UserTable {
//  implicit val encoder: JsonEncoder[UserTable] =
//    DeriveJsonEncoder.gen[UserTable]
//  implicit val decoder: JsonDecoder[UserTable] =
//    DeriveJsonDecoder.gen[UserTable]
//}
//
//case class PersistentUserRepo(ds: DataSource) extends UserRepo {
//  val ctx = new H2ZioJdbcContext(Escape)
//
//  import ctx._
//
//  override def register(user: User): Task[Option[String]] = {
//    for {
//      existing <- ctx
//        .run {
//          quote {
//            query[UserTable].filter(_.login == lift(user.login))
//          }
//        }
//        .provide(ZLayer.succeed(ds))
//
//      result <-
//        if (existing.nonEmpty) {
//          ZIO.succeed(None)
//        } else {
//          for {
//            id <- Random.nextUUID
//            _ <- ctx
//              .run {
//                quote {
//                  query[UserTable].insertValue {
//                    lift(UserTable(id, user.login, user.password))
//                  }
//                }
//              }
//              .provide(ZLayer.succeed(ds))
//          } yield Some(id.toString)
//        }
//
//    } yield result
//  }
//
//  override def login(user: User): Task[Option[String]] = {
//    ctx
//      .run {
//        quote {
//          query[UserTable]
//            .filter(p =>
//              p.login == lift(user.login) && p.password == lift(user.password)
//            )
//            .map(u => u.uuid)
//        }
//      }
//      .provide(ZLayer.succeed(ds))
//      .map(_.headOption.map(_.toString))
//  }
//
//  override def getAllUsers: Task[List[UserTable]] = {
//    ctx
//      .run {
//        quote {
//          query[UserTable]
//        }
//      }
//      .provide(ZLayer.succeed(ds))
//  }
//
//  override def lookup(id: String): Task[Option[String]] =
//    ctx
//      .run {
//        quote {
//          query[UserTable]
//            .filter(p => p.uuid == lift(UUID.fromString(id)))
//            .map(u => u.login)
//        }
//      }
//      .provide(ZLayer.succeed(ds))
//      .map(_.headOption)
//
////  override def users: Task[List[User]] =
////    ctx
////      .run {
////        quote {
////          query[UserTable].map(u => User(u.name, u.age))
////        }
////      }
////      .provide(ZLayer.succeed(ds))
//
//  override def getRecords(id: String): Task[Option[Records]] =
//    ctx
//      .run {
//        quote {
//          query[UserTimeStat]
//            .filter(_.uuid == lift(UUID.fromString(id)))
//        }
//      }
//      .provide(ZLayer.succeed(ds))
//      .map(_.headOption.map { stat =>
//        Records(
//          recs = List(
//            stat.`11`, stat.`16`, stat.`21`, stat.`26`, stat.`31`,
//            stat.`36`, stat.`41`, stat.`46`, stat.`51`, stat.`56`
//          )
//        )
//      })
//
//
//}
//
//object PersistentUserRepo {
//  def layer: ZLayer[Any, Throwable, PersistentUserRepo] =
//    DataSourceLayer.fromPrefix("UserApp") >>>
//      ZLayer.fromFunction(PersistentUserRepo(_))
//}
