package kanjiReader.statistics

import kanjiReader.leveling.WordGameResult
import zio._

trait StatisticsService {
  def update(
      id: Long,
      res: WordGameResult
  ): IO[StatError, Boolean]

  def get(
      id: Long
  ): IO[StatError, List[Byte]]
}

object StatisticsService {
  def update(
      id: Long,
      res: WordGameResult
  ): ZIO[StatisticsService, StatError, Boolean] =
    ZIO.serviceWithZIO[StatisticsService](_.update(id, res))

  def get(
      id: Long
  ): ZIO[StatisticsService, StatError, List[Byte]] =
    ZIO.serviceWithZIO[StatisticsService](_.get(id))
}
