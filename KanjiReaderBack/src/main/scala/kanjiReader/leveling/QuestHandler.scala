package kanjiReader.leveling

trait QuestHandler {
  def toPrintable(
      quest: Quest
  ): PrintableQuest

  def handleQuest(
      quest: Quest,
      res: WordGameResult
  ): Quest
}
