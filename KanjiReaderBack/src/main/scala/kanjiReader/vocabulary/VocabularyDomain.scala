package kanjiReader.vocabulary

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

//  {
//    "kanji": "尚更",
//    "furigana": "なおさら",
//    "english": "All The More",
//    "roman": "naosara"
//  },

case class Word(kanji: String, furigana: String, english: String, roman: String, word_list: Short, id: Long = 1L)

object Word {
  implicit val decoder: JsonDecoder[Word] = DeriveJsonDecoder.gen[Word]
  implicit val encoder: JsonEncoder[Word] = DeriveJsonEncoder.gen[Word]
}

trait VocabularyError {
  val message: String
}

case class VocabularyDbError(message: String) extends VocabularyError

case class WordList(id: Long, name: String)