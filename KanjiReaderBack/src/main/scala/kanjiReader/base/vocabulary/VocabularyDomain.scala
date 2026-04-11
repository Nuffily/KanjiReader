package kanjiReader.base.vocabulary

import zio.json.{DeriveJsonDecoder, DeriveJsonEncoder, JsonDecoder, JsonEncoder}

/**
 * Exemplar of word to guess
 * @param kanji word written with kanji
 * @param furigana furigana of word
 * @param english translation of the word
 * @param roman romanization of Japanese pronunciation
 * @param word_list wordList that word in
 * @param id id in DB
 */
case class Word(
    kanji: String,
    furigana: String,
    english: String,
    roman: String,
    word_list: Short,
    id: Long = 1L
)

object Word {
  implicit val decoder: JsonDecoder[Word] = DeriveJsonDecoder.gen[Word]
  implicit val encoder: JsonEncoder[Word] = DeriveJsonEncoder.gen[Word]
}

trait VocabularyError {
  val message: String
}

case class VocabularyDbError(message: String) extends VocabularyError

case class WordList(id: Long, name: String)
