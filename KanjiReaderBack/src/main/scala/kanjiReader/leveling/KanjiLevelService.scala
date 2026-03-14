package kanjiReader.leveling

import io.getquill.jdbczio.Quill
import io.getquill.{H2ZioJdbcContext, Literal}
import kanjiReader.kanjiUsers.UserRepo
import kanjiReader.leveling.QuestType._
import kanjiReader.leveling.handler.QuestHandler
import kanjiReader.statistics.StatisticsService
import kanjiReader.utils.Syntax._
import zio.{&, Clock, URIO, ZIO, ZLayer}

import javax.sql.DataSource
import scala.annotation.nowarn

case class KanjiLevelService(ds: DataSource, qh: QuestHandler)
    extends LevelService {
  val ctx = new H2ZioJdbcContext(Literal)
  import ctx._

  @nowarn("Don't you dare to annotate this")
  implicit val questInsertMeta = insertMeta[Quest](_.entry_id)

  private val WORD_LIST_COUNT = 11

  /** Создает случай квест
    */
  private def createQuest(id: Long): URIO[UserRepo, Quest] =
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

  override def refillQuests(
      id: Long
  ): ZIO[UserRepo, LevelError, List[Quest]] = {

    def generateUniqueQuests(
        count: Int,
        acc: List[Quest] = Nil
    ): URIO[UserRepo, List[Quest]] =
      if (count == 0) ZIO.succeed(acc)
      else {
        createQuest(id).flatMap { q =>
          val double = acc.exists(_.quest_type == q.quest_type)
          if (double) generateUniqueQuests(count, acc)
          else generateUniqueQuests(count - 1, q :: acc)
        }
      }

    for {
      quests <- generateUniqueQuests(3);

      _ <- ctx
        .transaction {
          for {
            _ <- ctx.run(
              query[Quest]
                .filter(_.user_id == lift(id))
                .delete
            )
            _ <- ctx.run(
              liftQuery(quests)
                .foreach(q => query[Quest].insertValue(q))
            )
          } yield ()
        }
        .provide(ZLayer.succeed(ds))
        .mapError(e => SomeLevelError(e.getMessage))

      _ <- UserRepo
        .refill(id)
        .mapError(e => SomeLevelError(e.message))
        .logInfo(
          s"Generated quests for user $id: ${quests.map(_.quest_type.toString + ", ")}"
        )
    } yield quests
  }

  override def addExperience(
      id: Long,
      exp: Int
  ): ZIO[UserRepo, LevelError, Boolean] =
    UserRepo
      .addExp(id, exp)
      .mapError(e => SomeLevelError(e.message))

  override def getQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]] = {

    val doRefill = UserRepo
      .refill(id)
      .mapError(e => SomeLevelError(e.message)) *> refillQuests(id)

    for {
      user <- UserRepo
        .lookupId(id)
        .mapError(e => SomeLevelError(e.message))
        .someOrFail(NoSuchUser(s"No $id"))

      now <- Clock.localDateTime
      isExpired = user.refill.isBefore(now)

      quests <-
        if (isExpired) doRefill
        else
          fetchQuestsFromDb(id).flatMap {
            case list => ZIO.succeed(list)
            case Nil  => doRefill
          }

    } yield quests
  }

  private def fetchQuestsFromDb(
      id: Long
  ): ZIO[UserRepo, LevelError, List[Quest]] =
    ctx
      .run(query[Quest].filter(_.user_id == lift(id)))
      .provide(ZLayer.succeed(ds))
      .mapError(e => DBLevelError(e.getMessage))

  override def checkResult(
      id: Long,
      res: WordGameResult
  ): ZIO[UserRepo & StatisticsService, LevelError, Boolean] = for {
    quests  <- getQuests(id)
    updated <- ZIO.foreach(quests)(handleQuest(id, _, res))
    _ <- StatisticsService
      .update(id, res)
      .mapError(e => SomeLevelError(e.message))
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
