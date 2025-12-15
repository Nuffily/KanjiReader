//package kanjiReader.users
//
//import zio._
//
//trait UserRepo {
//  def register(user: User): Task[Option[String]]
//
//  def login(user: User): Task[Option[String]]
//
//  def lookup(id: String): Task[Option[String]]
//
//  def getRecords(id: String): Task[Option[Records]]
//
//  def getAllUsers: Task[List[UserTable]]
////  def users: Task[List[User]]
//}
//
//object UserRepo {
//  def register(user: User): ZIO[UserRepo, Throwable, Option[String]] =
//    ZIO.serviceWithZIO[UserRepo](_.register(user))
//
//  def login(user: User): ZIO[UserRepo, Throwable, Option[String]] =
//    ZIO.serviceWithZIO[UserRepo](_.login(user))
//
//  def lookup(id: String): ZIO[UserRepo, Throwable, Option[String]] =
//    ZIO.serviceWithZIO[UserRepo](_.lookup(id))
//
//  def getRecords(id: String): ZIO[UserRepo, Throwable, Option[Records]] =
//    ZIO.serviceWithZIO[UserRepo](_.getRecords(id))
//
//  def getAllUsers: ZIO[UserRepo, Throwable, List[UserTable]] =
//    ZIO.serviceWithZIO[UserRepo](_.getAllUsers)
//}
