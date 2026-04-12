//package kanjiReader.utils.cache
//
//import org.checkerframework.checker.units.qual.K
//import zio.redis.{Redis, RedisError}
//import zio.schema._
//import zio.{&, Duration, UIO, ZIO}
//
//case class KanjiRedisCache[V: Schema](prefix: String, ttl: Duration) {
//
//  def put(key: String, value: V): ZIO[Redis, RedisError, Boolean] =
//    ZIO.serviceWithZIO[Redis](_.hSet(hashKey, key, value, Some(ttl)))
////    for {
////      redis <- ZIO.service[Redis]
////      _     <- redis.set("myKey", 8L, Some(1.minutes))
////      v     <- redis.get("myKey").returning[Long]
////      _     <- Console.printLine(s"Value of myKey: $v").orDie
////      _     <- redis.hSet("myHash", ("k1", 6), ("k2", 2))
////      _     <- redis.rPush("myList", 1, 2, 3, 4)
////      _     <- redis.sAdd("mySet", "a", "b", "a", "c")
////    } yield ()
//
//  def get(key: K): ZIO[Redis, RedisError, Option[V]] =
//    ZIO.serviceWithZIO[Redis](_.get(key).returning[V])
//
//  def getOrElseZIO[R, E](key: K)(compute: ZIO[R, E, V]): ZIO[R & Redis, Either[RedisError, E], V] =
//    ZIO.serviceWithZIO[Redis] { redis =>
//      redis.get(key).returning[V].mapError(Left(_)).flatMap {
//        case Some(value) => ZIO.succeed(value)
//        case None => compute.mapError(Right(_))
//      }
//    }
//
//  def remove(key: K): ZIO[Redis, RedisError, Option[V]] =
//    ZIO.serviceWithZIO[Redis](_.del(key).returning[V])
//
//  def size: UIO[Int] = ???
//
//  def clear: UIO[Unit] = ???
//}
//
////package kanjiReader.utils.cache
////
////import zio.redis.{Redis, RedisError}
////import zio.schema._
////import zio.{&, Duration, UIO, ZIO}
////
////case class KanjiRedisCache[K: Schema, V: Schema](prefix: String, ttl: Duration) {
////
////  def put(key: K, value: V): ZIO[Redis, RedisError, Boolean] =
////    ZIO.serviceWithZIO[Redis](_.hSet(hashKey, (key, value), Some(ttl)))
//////    for {
//////      redis <- ZIO.service[Redis]
//////      _     <- redis.set("myKey", 8L, Some(1.minutes))
//////      v     <- redis.get("myKey").returning[Long]
//////      _     <- Console.printLine(s"Value of myKey: $v").orDie
//////      _     <- redis.hSet("myHash", ("k1", 6), ("k2", 2))
//////      _     <- redis.rPush("myList", 1, 2, 3, 4)
//////      _     <- redis.sAdd("mySet", "a", "b", "a", "c")
//////    } yield ()
////
////  def get(key: K): ZIO[Redis, RedisError, Option[V]] =
////    ZIO.serviceWithZIO[Redis](_.get(key).returning[V])
////
////  def getOrElseZIO[R, E](key: K)(compute: ZIO[R, E, V]): ZIO[R & Redis, Either[RedisError, E], V] =
////    ZIO.serviceWithZIO[Redis] { redis =>
////      redis.get(key).returning[V].mapError(Left(_)).flatMap {
////        case Some(value) => ZIO.succeed(value)
////        case None => compute.mapError(Right(_))
////      }
////    }
////
////  def remove(key: K): ZIO[Redis, RedisError, Option[V]] =
////    ZIO.serviceWithZIO[Redis](_.del(key).returning[V])
////
////  def size: UIO[Int] = ???
////
////  def clear: UIO[Unit] = ???
////}
