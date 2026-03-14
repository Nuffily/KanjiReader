package kanjiReader.vocabulary

import zio.{IO, ZIO};

trait WordService {

  def getWords(wordList: String, count: Int): IO[VocabularyError, List[Word]]
}

object WordService {
  def getWords(
      wordList: String,
      count: Int
  ): ZIO[WordService, VocabularyError, List[Word]] =
    ZIO.serviceWithZIO[WordService](_.getWords(wordList, count))
}
