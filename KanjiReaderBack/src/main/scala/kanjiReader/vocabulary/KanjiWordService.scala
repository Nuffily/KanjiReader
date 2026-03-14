package kanjiReader.vocabulary;

import io.getquill.jdbczio.Quill
import io.getquill.{H2ZioJdbcContext, Literal}
import zio.{IO, ZLayer}

import javax.sql.DataSource

case class KanjiWordService(ds: DataSource) extends WordService {
  val ctx = new H2ZioJdbcContext(Literal)
  import ctx._

  override def getWords(
      wordList: String,
      count: Int
  ): IO[VocabularyError, List[Word]] = {
    val q = quote {
      query[Word]
        .join(query[WordList])
        .on((w, wl) => w.word_list == wl.id)
        .filter { case (w, wl) => wl.name == lift(wordList) }
        .map { case (w, wl) => w }
        .sortBy(_ => sql"RAND()".as[Double])
        .take(lift(count))
    }

    ctx
      .run(q)
      .mapError(e => VocabularyDbError(e.getMessage))
      .provide(ZLayer.succeed(ds))
  }
}

object KanjiWordService {
  def layer: ZLayer[Any, Throwable, KanjiWordService] =
    Quill.DataSource.fromPrefix("WordList") >>>
      ZLayer.fromFunction(KanjiWordService(_))
}
