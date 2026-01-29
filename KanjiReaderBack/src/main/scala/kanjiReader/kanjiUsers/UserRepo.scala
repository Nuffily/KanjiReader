package kanjiReader.kanjiUsers

import zio._

trait UserRepo {

  /** Регистрирует пользователя с [id]
    */
  def register(id: Long): IO[UserError, Boolean]

  /** Возвращает пользователя с [id] из БД, если он есть. Иначе None
    */
  def lookupId(id: Long): IO[UserError, Option[UserTable]]

  /** Возвращает пользователя с [id] из БД, если он есть. Иначе регистрирует и
    * возвращает его
    */
  def lookupOrRegister(id: Long): IO[UserError, UserTable]

  /** Обновляет refill пользователя и возвращает True, если пользователь есть
    */
  def refill(id: Long): IO[UserError, Boolean]

  /** Добавляет опыт пользователю и возвращает True, если такой нашелся
    */
  def addExp(id: Long, exp: Int): IO[UserError, Boolean]
}

object UserRepo {

  /** Регистрирует пользователя с [id]
    */
  def register(id: Long): ZIO[UserRepo, UserError, Boolean] =
    ZIO.serviceWithZIO[UserRepo](_.register(id))

  /** Возвращает пользователя с [id] из БД, если он есть. Иначе None
    */
  def lookupId(id: Long): ZIO[UserRepo, UserError, Option[UserTable]] =
    ZIO.serviceWithZIO[UserRepo](_.lookupId(id))

  /** Возвращает пользователя с [id] из БД, если он есть. Иначе регистрирует и
    * возвращает его
    */
  def lookupOrRegister(id: Long): ZIO[UserRepo, UserError, UserTable] =
    ZIO.serviceWithZIO[UserRepo](_.lookupOrRegister(id))

  /** Обновляет refill пользователя и возвращает True, если пользователь есть
    */
  def refill(id: Long): ZIO[UserRepo, UserError, Boolean] =
    ZIO.serviceWithZIO[UserRepo](_.refill(id))

  /** Добавляет опыт пользователю и возвращает True, если такой нашелся
    */
  def addExp(id: Long, exp: Int): ZIO[UserRepo, UserError, Boolean] =
    ZIO.serviceWithZIO[UserRepo](_.addExp(id, exp))
}
