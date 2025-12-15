package kanjiReader.kanjiUsers

import zio._

trait UserRepo {
  def register(id: Int): Task[Boolean]

  def lookup(id: Int): Task[Option[UserTable]]

//  def getAllUsers: Task[List[UserTable]]
}

object UserRepo {
  def register(id: Int): ZIO[UserRepo, Throwable, Boolean] =
    ZIO.serviceWithZIO[UserRepo](_.register(id))

  def lookup(id: Int): ZIO[UserRepo, Throwable, Option[UserTable]] =
    ZIO.serviceWithZIO[UserRepo](_.lookup(id))

//  def getAllUsers: ZIO[UserRepo, Throwable, List[UserTable]] =
//    ZIO.serviceWithZIO[UserRepo](_.getAllUsers)
}
