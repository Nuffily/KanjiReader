package kanjiReader.config

import zio._
import zio.redis._
import zio.schema.Schema
import zio.schema.codec.{BinaryCodec, ProtobufCodec}

object KanjiRedisConfig {


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
