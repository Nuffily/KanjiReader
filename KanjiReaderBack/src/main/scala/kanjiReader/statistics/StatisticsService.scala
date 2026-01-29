package kanjiReader.statistics

import kanjiReader.leveling.WordGameResult
import zio._

trait StatisticsService {

  /** Обнавляет статистику пользователя с [id] в зависимости от результата
    */
  def update(
      id: Long,
      res: WordGameResult
  ): IO[StatError, Boolean]

  /** Возвращает статистику пользователя [id] как список, где каждое значение -
    * процент верных ответов за последние пять попыток в соответствующем
    * wordList
    */
  def get(
      id: Long
  ): IO[StatError, List[Byte]]
}

object StatisticsService {

  /** Обнавляет статистику пользователя с [id] в зависимости от результата
    */
  def update(
      id: Long,
      res: WordGameResult
  ): ZIO[StatisticsService, StatError, Boolean] =
    ZIO.serviceWithZIO[StatisticsService](_.update(id, res))

  /** Возвращает статистику пользователя [id] как список, где каждое значение -
    * процент верных ответов за последние пять попыток в соответствующем
    * wordList
    */
  def get(
      id: Long
  ): ZIO[StatisticsService, StatError, List[Byte]] =
    ZIO.serviceWithZIO[StatisticsService](_.get(id))
}
