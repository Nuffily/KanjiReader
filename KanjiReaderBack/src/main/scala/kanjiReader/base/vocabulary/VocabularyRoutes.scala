package kanjiReader.base.vocabulary

import zio.{&, Random, ZIO}
import zio.http.{Method, Request, Response, Routes, handler, int, string}
import zio.json.EncoderOps

object VocabularyRoutes {

  def apply(): Routes[Random & WordService, Response] =
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
            shuffled <- ZIO.serviceWithZIO[WordService](_.getWords(set, number))
          } yield Response.json(shuffled.toJson))
            .catchAll { error =>
              ZIO.succeed(Response.text(s"Error: $error"))
            }
      }
    )
}
