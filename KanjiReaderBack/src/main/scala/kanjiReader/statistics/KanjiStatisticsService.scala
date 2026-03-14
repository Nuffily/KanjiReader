package kanjiReader.statistics

import io.getquill.jdbczio.Quill
import io.getquill.{H2ZioJdbcContext, Literal, Ord}
import kanjiReader.leveling.WordGameResult
import zio.{IO, ZIO, ZLayer}

import javax.sql.DataSource

case class KanjiStatisticsService(ds: DataSource) extends StatisticsService {

  val ctx = new H2ZioJdbcContext(Literal)

  import ctx._

  private val WORD_LIST_COUNT = 10

  override def update(
      id: Long,
      res: WordGameResult
  ): IO[StatError, Boolean] = {

    val queryBase = quote {
      query[Statistic].filter(s =>
        s.id == lift(id)
          && s.word_list == lift(res.wordList)
      )
    }

    val task = for {
      records <- ctx.run(queryBase.sortBy(_.attempt)(Ord.asc))

      _ <- records match {
        case list if list.size < 5 =>
          val newStat = new Statistic(id, list.size + 1, res)
          ctx.run(query[Statistic].insertValue(lift(newStat)))
        case head :: _ =>
          ctx.run(
            queryBase
              .filter(_.attempt == lift(head.attempt))
              .update(
                s => s.attempt -> (s.attempt + 5),
                s => s.correct -> lift(res.correctCount),
                s => s.number -> lift(res.count)
              )
          )
      }
    } yield true

    ctx
      .transaction(task)
      .provide(ZLayer.succeed(ds))
      .mapError(e => DBStatError(e.getMessage))
  }

  override def get(id: Long): IO[StatError, List[Byte]] = for {
    list <- ctx
      .run {
        query[Statistic].filter(_.id == lift(id)).sortBy(_.word_list)
      }
      .provide(ZLayer.succeed(ds))
      .mapError(e => DBStatError(e.getMessage))

  } yield (1 to WORD_LIST_COUNT)
    .map(n =>
      list
        .filter(_.word_list == n)
        .foldLeft((0, 0)) { (count, next) =>
          (count._1 + next.number, count._2 + next.correct)
        }
    )
    .map { case (count, correct) =>
      if (count > 0) correct * 100 / count else 0
    }
    .map(_.toByte)
    .toList

}

object KanjiStatisticsService {
  def layer: ZLayer[Any, Throwable, KanjiStatisticsService] =
    Quill.DataSource.fromPrefix("Statistic") >>>
      ZLayer.fromFunction(KanjiStatisticsService(_))
}
