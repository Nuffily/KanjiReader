package kanjiReader.leveling

import io.getquill.jdbczio.Quill
import io.getquill.{Escape, H2ZioJdbcContext, Literal}
import kanjiReader.kanjiUsers.{
  OtherUserError,
  PersistentUserRepo,
  UserRepo,
  UserTable
}
import kanjiReader.leveling.QuestType._
import zio._

import javax.sql.DataSource

case class KanjiLevelService(ds: DataSource) extends LevelService {

//  val ctx = new H2ZioJdbcContext(Escape)
  val ctx = new H2ZioJdbcContext(Literal)
  import ctx._

//  implicit val questMeta = schemaMeta[Quest](
//    "Quest",
//    _.entry_id    -> "entry_id",
//    _.user_id     -> "user_id",
//    _.quest_type  -> "quest_type",
//    _.word_list   -> "word_list",
//    _.is_complete -> "is_complete"
//  )

  implicit val questInsertMeta = insertMeta[Quest](_.entry_id)

  private val WORD_LIST_COUNT = 11

  private def createQuest(id: Long): ZIO[UserRepo, LevelError, Quest] =
    for {
      random    <- ZIO.random
      questType <- random.nextIntBetween(0, QuestType.maxId + 1)
      wordList  <- random.nextIntBetween(1, WORD_LIST_COUNT)

      parameter <- QuestType(questType) match {
//        case CorrectPer1M => random.nextIntBetween(10, 15)
        case CorrectPer1M => random.nextIntBetween(2, 5)
//        case CorrectPer2M => random.nextIntBetween(20, 25)
        case CorrectPer2M => random.nextIntBetween(2, 5)
        case PercentIn1M  => random.nextIntBetween(60, 80)
        case PercentIn2M  => random.nextIntBetween(60, 80)
        case InRow1M      => random.nextIntBetween(5, 7)
        case InRow2M      => random.nextIntBetween(7, 9)
        case SumCorrect   => random.nextIntBetween(50, 70)
      }

      parameter2 <- QuestType(questType) match {
        case PercentIn1M => random.nextIntBetween(10, 15)
        case PercentIn2M => random.nextIntBetween(15, 20)
        case _           => ZIO.succeed(0)
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

//      _ <- Console.printLine("AAGHGAG").ignore

      quest1 <- createQuest(id)
      quest2 <- createQuest(id).repeatWhile(q =>
        quest1.quest_type == q.quest_type
      )

//      _ <- Console.printLine("Refill!").ignore
//      _ <- Console.printLine("AAGHGAG3").ignore
      _ <- ctx
        .run {
          quote {
            liftQuery(List(quest1, quest2)).foreach { q =>
              query[Quest].insertValue(q)
            }
          }
        }
        .provide(ZLayer.succeed(ds))
        .mapError(e => SomeLevelError(e.getMessage))

      _ <- Console.printLine(List(quest1, quest2)).ignore

      _ <- UserRepo
        .refill(id)
        .mapError(e => SomeLevelError(e.message))

    } yield List(quest1, quest2)

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

//      _ <- Console.printLine(s"GEt! $now $elapse").ignore

      quests <- (if (elapse.isBefore(now)) {
                   UserRepo.refill(id) *>
                     Console.printLine("Elapse!!").ignore *>
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
  ): ZIO[UserRepo, LevelError, Boolean] = for {
    quests <- getQuests(id)

    updated <- ZIO.foreach(quests)(handleQuest(id, _, res))

  } yield updated.contains(true)

  override def markComplete(
      id: Long,
      quest: Long
  ): ZIO[UserRepo, LevelError, Boolean] = for {
    updated <- ctx
      .run {
        query[Quest]
          .filter(q => q.user_id == lift(id) && q.is_complete == lift(false))
          .update(_.is_complete -> lift(true))
      }
      .provide(ZLayer.succeed(ds))
      .mapError(e => DBLevelError(e.getMessage))
  } yield updated > 0

  override def handleQuest(
      id: Long,
      quest: Quest,
      res: WordGameResult
  ): ZIO[UserRepo, LevelError, Boolean] = {

    val newQuest = QuestHandler.handleQuest(quest, res)

//    println(quest)
//    println(newQuest)

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
      } yield updated > 0
  }
}

object KanjiLevelService {
  def layer: ZLayer[Any, Throwable, KanjiLevelService] =
    Quill.DataSource.fromPrefix("Quest") >>>
      ZLayer.fromFunction(KanjiLevelService(_))
}
