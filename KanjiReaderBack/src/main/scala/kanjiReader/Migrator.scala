package kanjiReader

import org.flywaydb.core.Flyway
import zio.{Task, ZIO}

object Migrator {
  val run: Task[Unit] = ZIO.attempt {
    val flyway = Flyway
      .configure()
      .dataSource("jdbc:h2:./kanjiapp;AUTO_SERVER=TRUE", "sa", "")
      .load()

    flyway.migrate()
  }.unit
}
