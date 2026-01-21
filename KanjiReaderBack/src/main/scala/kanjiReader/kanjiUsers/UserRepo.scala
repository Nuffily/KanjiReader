package kanjiReader.kanjiUsers

import zio._

trait UserRepo {
  def register(id: Long): IO[UserError, Boolean]

  def lookupId(id: Long): IO[UserError, Option[UserTable]]

  def lookupOrRegister(id: Long): IO[UserError, UserTable]

  def refill(id: Long): IO[UserError, Boolean]

  def addExp(id: Long, exp: Int): IO[UserError, Boolean]
}

object UserRepo {
  def register(id: Long): ZIO[UserRepo, UserError, Boolean] =
    ZIO.serviceWithZIO[UserRepo](_.register(id))

  def lookupId(id: Long): ZIO[UserRepo, UserError, Option[UserTable]] =
    ZIO.serviceWithZIO[UserRepo](_.lookupId(id))

  def lookupOrRegister(id: Long): ZIO[UserRepo, UserError, UserTable] =
    ZIO.serviceWithZIO[UserRepo](_.lookupOrRegister(id))

  def refill(id: Long): ZIO[UserRepo, UserError, Boolean] =
    ZIO.serviceWithZIO[UserRepo](_.refill(id))

  def addExp(id: Long, exp: Int): ZIO[UserRepo, UserError, Boolean] =
    ZIO.serviceWithZIO[UserRepo](_.addExp(id, exp))
}
