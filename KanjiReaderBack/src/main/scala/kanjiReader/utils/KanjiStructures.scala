package kanjiReader

import zio._
import java.time.Instant

object KanjiStructures {

  class KanjiCache[K, V] private (
      private val map: Ref[Map[K, (V, Instant)]],
      private val ttl: Duration
  ) {

    def put(key: K, value: V): UIO[Unit] =
      for {
        now <- Clock.instant
        _   <- map.update(_.updated(key, (value, now.plus(ttl))))
      } yield ()

    def get(key: K): UIO[Option[V]] =
      for {
        now  <- Clock.instant
        data <- map.get
      } yield data.get(key).collect {
        case (value, expiresAt) if now.isBefore(expiresAt) => value
      }

    def getOrElseZIO[R, E](key: K)(compute: ZIO[R, E, V]): ZIO[R, E, V] =
      get(key).flatMap {
        case Some(value) => ZIO.succeed(value)
        case None =>
          compute.flatMap { value =>
            put(key, value).as(value)
          }
      }

    def remove(key: K): UIO[Unit] =
      map.update(_ - key)

    def size: UIO[Int] =
      map.get.map(_.size)

    def clear: UIO[Unit] =
      map.set(Map.empty)
  }

  object KanjiCache {

    def make[K, V](
        ttl: Duration = 1.minute
    ): ZIO[Scope, Nothing, KanjiCache[K, V]] =
      for {
        map <- Ref.make(Map.empty[K, (V, Instant)])
        _   <- cleanupTask(map).forkScoped
      } yield new KanjiCache(map, ttl)

    private def cleanupTask[K, V](
        map: Ref[Map[K, (V, Instant)]]
    ): UIO[Nothing] =
      (for {
        _   <- ZIO.sleep(30.seconds)
        now <- Clock.instant
        _ <- map.update(_.filter { case (_, (_, expiresAt)) =>
          now.isBefore(expiresAt)
        })
      } yield ()).forever
  }
}
