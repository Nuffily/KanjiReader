package kanjiReader.vocabulary

import zio._
import zio.json._

//  {
//    "kanji": "尚更",
//    "furigana": "なおさら",
//    "english": "All The More",
//    "roman": "naosara"
//  },

case class Word(kanji: String, furigana: String, english: String, roman: String)

object Word {
  implicit val decoder: JsonDecoder[Word] = DeriveJsonDecoder.gen[Word]
  implicit val encoder: JsonEncoder[Word] = DeriveJsonEncoder.gen[Word]
}

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
          .mapError(_.toString)
      }

}
