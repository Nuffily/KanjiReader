package kanjiReader.leveling

import io.getquill.{Escape, H2ZioJdbcContext}
import kanjiReader.kanjiUsers.UserRepo
import zio.ZIO

import javax.sql.DataSource

case class KanjiLevelService(ds: DataSource) extends LevelService {

  val ctx = new H2ZioJdbcContext(Escape)
  import ctx._

  override def createQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]] = ???

  override def addExperience(id: Long): ZIO[UserRepo, LevelError, Boolean] = ???

  override def getQuests(id: Long): ZIO[UserRepo, LevelError, List[Quest]] = ???

  override def checkResult(id: Long, res: WordGameResult): ZIO[UserRepo, LevelError, Boolean] = ???

  override def markComplete(id: Long, quest: Long): ZIO[UserRepo, LevelError, Boolean] = ???

  override def handleQuest(id: Long, quest: Quest, res: WordGameResult): ZIO[UserRepo, LevelError, List[Quest]] = ???
}
