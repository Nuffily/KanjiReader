package kanjiReader.leveling

import io.getquill.jdbczio.Quill
import io.getquill.{H2ZioJdbcContext, Literal}
import kanjiReader.kanjiUsers.UserRepo
import kanjiReader.leveling.QuestType._
import kanjiReader.statistics.StatisticsService
import zio._

import javax.sql.DataSource

case class KanjiLevelService(ds: DataSource, qh: QuestHandler)
    extends LevelService {

  val ctx = new H2ZioJdbcContext(Literal)
  import ctx._

  implicit val questInsertMeta = insertMeta[Quest](_.entry_id)

  private val WORD_LIST_COUNT = 11

  private def createQuest(id: Long): ZIO[UserRepo, LevelError, Quest] =
    for {
      random    <- ZIO.random
      questType <- random.nextIntBetween(0, QuestType.maxId)
      wordList  <- random.nextIntBetween(1, WORD_LIST_COUNT)

      parameter <- QuestType(questType) match {
        case CorrectPer1M => random.nextIntBetween(9, 12)
        case CorrectPer2M => random.nextIntBetween(15, 20)
        case Percent      => random.nextIntBetween(60, 80)
        case InRow1M      => random.nextIntBetween(5, 7)
        case InRow2M      => random.nextIntBetween(7, 9)
        case SumCorrect   => random.nextIntBetween(40, 70)
      }

      parameter2 <- QuestType(questType) match {
        case Percent => random.nextIntBetween(10, 15)
        case _       => ZIO.succeed(0)
      }

    } yield Quest(
      id,
      questType.toByte,
      wordList.toByte,
      parameter = parameter.toByte,
      parameter2 = parameter2.toByte
    )

  override def refillQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]] =
    for {

      _ <- ctx
        .run(query[Quest].filter(_.user_id == lift(id)).delete)
        .provide(ZLayer.succeed(ds))
        .mapError(e => DBLevelError(e.getMessage))

      quest1 <- createQuest(id)

      quest2 <- createQuest(id).repeatWhile(q =>
        quest1.quest_type == q.quest_type
      )

      quest3 <- createQuest(id).repeatWhile(q =>
        quest2.quest_type == q.quest_type &&
          quest1.quest_type == q.quest_type
      )

      _ <- ctx
        .run {
          quote {
            liftQuery(List(quest1, quest2, quest3)).foreach { q =>
              query[Quest].insertValue(q)
            }
          }
        }
        .provide(ZLayer.succeed(ds))
        .mapError(e => SomeLevelError(e.getMessage))

      _ <- UserRepo
        .refill(id)
        .mapError(e => SomeLevelError(e.message))

    } yield List(quest1, quest2, quest3)

  override def addExperience(
      id: Long,
      exp: Int
  ): ZIO[UserRepo, LevelError, Boolean] =
    UserRepo
      .addExp(id, exp)
      .mapError(e => SomeLevelError(e.message))

  override def getQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]] =
    for {
      elapse <- UserRepo
        .lookupId(id)
        .mapError(e => SomeLevelError(e.message))
        .someOrFail(NoSuchUser(s"No $id"))
        .map(_.refill)

      now <- Clock.localDateTime

      quests <- (if (elapse.isBefore(now)) {
                   UserRepo.refill(id) *>
                     refillQuests(id)
                 } else {
                   ctx
                     .run {
                       query[Quest].filter(_.user_id == lift(id))
                     }
                     .provide(ZLayer.succeed(ds))
                 }).mapError(e => SomeLevelError(e.toString))

    } yield quests

  override def checkResult(
      id: Long,
      res: WordGameResult
  ): ZIO[UserRepo & StatisticsService, LevelError, Boolean] = for {
    quests <- getQuests(id)

    updated <- ZIO.foreach(quests)(handleQuest(id, _, res))
    _ <- StatisticsService.update(id, res)
      .mapError(e => {println(e); SomeLevelError(e.message)})

  } yield updated.contains(true)

  override def handleQuest(
      id: Long,
      quest: Quest,
      res: WordGameResult
  ): ZIO[UserRepo, LevelError, Boolean] = {

    val newQuest = qh.handleQuest(quest, res)
    if (newQuest == quest) ZIO.succeed(false)
    else
      for {

        updated <- ctx
          .run {
            query[Quest]
              .filter(q => q.entry_id == lift(quest.entry_id))
              .updateValue(lift(newQuest))
          }
          .provide(ZLayer.succeed(ds))
          .mapError(e => DBLevelError(e.getMessage))

        _ <-
          if (updated > 0 && newQuest.is_complete != quest.is_complete)
            addExperience(id, 10)
          else ZIO.unit

      } yield updated > 0
  }
}

object KanjiLevelService {
  def layer(qh: QuestHandler): ZLayer[Any, Throwable, KanjiLevelService] =
    Quill.DataSource.fromPrefix("Quest") >>>
      ZLayer.fromFunction(KanjiLevelService(_, qh))
}
