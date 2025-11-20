package kanjiReader.vocabulary

package zxc.greet

import zio._
import zio.http._
import zio.json.EncoderOps

object VocabularyRoutes {

//  private lazy val WK51_55 =
//    JsonFileReader.readWordsFromFile("vocabulary/WK51-55.json")

  def apply(): Routes[Random, Response] =
    Routes(
      Method.GET / "vocabulary" / string("set") / int("number") -> handler {
        (set: String, number: Int, _: Request) =>
          (for {
            r <- JsonFileReader.readWordsFromFile(s"vocabulary/$set.json")
            z <- Shuffler.getRandomItemsZIO(r, number)
          } yield Response.json(z.toJson))
            .catchAll { error =>
              ZIO.fail(Response.text(s"Error: $error"))
            }
      }
    )
}
