package kanjiReader.vocabulary

import zio._
import zio.json._

@Deprecated
object JsonFileReader {

  def readWordsFromFile(
      resourcePath: String
  ): ZIO[Any, String, List[Word]] =
    ZIO
      .attempt {
        val source = scala.io.Source.fromResource(resourcePath)
        try source.mkString
        finally source.close()
      }
      .mapError(_.getMessage)
      .flatMap { content =>
        ZIO
          .fromEither(content.fromJson[List[Word]])
      }

}
