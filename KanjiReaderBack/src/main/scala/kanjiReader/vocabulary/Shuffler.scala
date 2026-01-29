package kanjiReader.vocabulary

import zio.{Random, ZIO}

object Shuffler {

  /** Выдает случайные [n] элементов из списка [list]
    */
  def getRandomItemsZIO(
      list: List[Word],
      n: Int
  ): ZIO[Random, String, List[Word]] =
    for {
      _        <- ZIO.fail("Array is empty").when(list.isEmpty)
      random   <- ZIO.random
      shuffled <- random.shuffle(list)
      result = shuffled.take(math.min(n, list.size))
    } yield result

}
