package kanjiReader.leveling

trait QuestHandler {

  /** Возвращает представление квеста в виде для отправки на фронт
    */
  def toPrintable(
      quest: Quest
  ): PrintableQuest

  /** Обновляет прогресс квеста в зависимости от результата игры, возвращает
    * измененный
    */
  def handleQuest(
      quest: Quest,
      res: WordGameResult
  ): Quest
}
