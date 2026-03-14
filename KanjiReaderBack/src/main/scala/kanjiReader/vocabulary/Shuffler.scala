package kanjiReader.vocabulary

import zio.{Random, ZIO}

@Deprecated
object Shuffler {

  /** Выдает случайные [n] элементов из списка [list]
    */
  def getRandomItemsZIO(
      list: List[Word],
      n: Int
  ): ZIO[Random, String, List[Word]] = {
    if (list.isEmpty) ZIO.fail("Array is empty")
    else {
      val size = list.size
      val k    = math.min(n, size)

      for {
        random <- ZIO.random

        array = list.toArray

        result <- ZIO.foldLeft(0 until k)(List.empty[Word]) { (acc, i) =>
          for {
            j <- random.nextIntBetween(i, size)
            _ = {
              val temp = array(i)
              array(i) = array(j)
              array(j) = temp
            }
          } yield array(i) :: acc
        }
      } yield result.reverse

    }
  }

}
