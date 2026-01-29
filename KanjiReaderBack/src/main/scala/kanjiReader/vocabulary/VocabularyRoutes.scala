package kanjiReader.vocabulary

import zio._
import zio.http._
import zio.json.EncoderOps

object VocabularyRoutes {

  def apply(): Routes[Random, Response] =
    Routes(
      /** Выдает список из [number] объектов типа
        * ```
        * {
        * "kanji": "憂鬱",
        * "furigana": "ゆううつ",
        * "english": "Depression",
        * "roman": "yuuutsu"
        * }
        * ```
        * в перемешанном виде (с помощью Shuffler)
        */
      Method.GET / "vocabulary" / string("set") / int("number") -> handler {
        (set: String, number: Int, _: Request) =>
          (for {
            words <- JsonFileReader.readWordsFromFile(s"vocabulary/$set.json")
            shuffled <- Shuffler.getRandomItemsZIO(words, number)
          } yield Response.json(shuffled.toJson))
            .catchAll { error =>
              ZIO.fail(Response.text(s"Error: $error"))
            }
      }
    )
}
