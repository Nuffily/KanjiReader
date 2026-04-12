package kanjiReader.config

import zio._
import zio.redis._
import zio.schema.Schema
import zio.schema.codec.{BinaryCodec, ProtobufCodec}

object KanjiRedisConfig {

//  val configLayer: ZLayer[Any, Throwable, RedisConfig] = ZLayer {
//    for {
//      host <- System.env("REDIS_HOST").map(_.getOrElse("localhost"))
//
//      portString <- System.env("REDIS_PORT").map(_.getOrElse("6379"))
//      port <- ZIO
//        .attempt(portString.toInt)
//        .mapError(_ => new Exception(s"Invalid REDIS_PORT: $portString"))
//
//      _ <- Console.printLine(s"Подключаемся к Redis на $host:$port")
//    } yield RedisConfig(host, port)
//  }
  private object ProtobufCodecSupplier extends CodecSupplier {
    def get[A: Schema]: BinaryCodec[A] = ProtobufCodec.protobufCodec
  }

  private val config: RedisConfig = RedisConfig(
    host = sys.env.getOrElse("REDIS_HOST", "localhost"),
    port = sys.env.getOrElse("REDIS_PORT", "6379").toInt
  )

  val layer: ZLayer[Any, RedisError.IOError, Redis & AsyncRedis & RedisConfig & CodecSupplier] =
    (ZLayer.succeed(config) ++ ZLayer.succeed(ProtobufCodecSupplier)) >+> Redis.singleNode
}
