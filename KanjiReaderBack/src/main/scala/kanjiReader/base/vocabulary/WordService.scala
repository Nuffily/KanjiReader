package kanjiReader.base.vocabulary

import zio.{IO, ZIO};

/**
 * Service for getting words to guess
 */
trait WordService {

  /**
   * Returns a list of words in random order
   * @param wordList name of word_list to take words from
   * @param count count of words to take
   * @return list of words
   */
  def getWords(wordList: String, count: Int): IO[VocabularyError, List[Word]]
}

/**
 * Service for getting words to guess
 */
object WordService {

  /**
   * Returns a list of words in random order
   * @param wordList name of word_list to take words from
   * @param count count of words to take
   * @return list of words
   */
  def getWords(
      wordList: String,
      count: Int
  ): ZIO[WordService, VocabularyError, List[Word]] =
    ZIO.serviceWithZIO[WordService](_.getWords(wordList, count))
}
