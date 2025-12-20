package kanjiReader.kanjiUsers

import zio._

trait UserRepo {
  def register(id: Long): Task[Boolean]

  def lookupId(id: Long): Task[Option[UserTable]]

  def lookupOrRegister(id: Long): Task[UserTable]

//  def getAllUsers: Task[List[UserTable]]
}

object UserRepo {
  def register(id: Long): ZIO[UserRepo, Throwable, Boolean] =
    ZIO.serviceWithZIO[UserRepo](_.register(id))

  def lookupId(id: Long): ZIO[UserRepo, Throwable, Option[UserTable]] =
    ZIO.serviceWithZIO[UserRepo](_.lookupId(id))

  def lookupOrRegister(id: Long): ZIO[UserRepo, Throwable, UserTable] =
    ZIO.serviceWithZIO[UserRepo](_.lookupOrRegister(id))

//  def getAllUsers: ZIO[UserRepo, Throwable, List[UserTable]] =
//    ZIO.serviceWithZIO[UserRepo](_.getAllUsers)
}
