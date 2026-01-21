package kanjiReader.leveling

import kanjiReader.leveling.QuestType._

object KanjiQuestHandler extends QuestHandler {

  def toPrintable(
      quest: Quest
  ): PrintableQuest = QuestType(quest.quest_type) match {
    case CorrectPer1M =>
      PrintableQuest(
        "CorrectPer1M",
        s"Enter ${quest.parameter} correct answers in one minute in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )
    case CorrectPer2M =>
      PrintableQuest(
        "CorrectPer2M",
        s"Enter ${quest.parameter} correct answers in two minute in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )

    case Percent =>
      PrintableQuest(
        "Percent",
        s"Enter ${quest.parameter}% correct answers with minimum sum answers ${quest.parameter2} in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )

    case InRow1M =>
      PrintableQuest(
        "InRow1M",
        s"Get ${quest.parameter} correct answers in row in one minute in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )
    case InRow2M =>
      PrintableQuest(
        "InRow2M",
        s"Get ${quest.parameter} correct answers in row in two minutes in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )
    case SumCorrect =>
      PrintableQuest(
        "CorrectSum",
        s"Get ${quest.parameter} correct answers in the collection @",
        quest.progress,
        quest.parameter,
        quest.word_list,
        quest.is_complete
      )
  }

  def handleQuest(
      quest: Quest,
      res: WordGameResult
  ): Quest = if (res.wordList != quest.word_list) quest
  else
    QuestType(quest.quest_type) match {
      case CorrectPer1M =>
        if (res.time != 1 || res.correctCount < quest.parameter) quest
        else {
          quest.copy(is_complete = true)
        }
      case CorrectPer2M =>
        if (res.time != 2 || res.correctCount < quest.parameter) quest
        else {
          quest.copy(is_complete = true)
        }

      case Percent =>
        if (
          res.count < quest.parameter2 || (res.correctCount / res.count) * 100 < quest.parameter
        ) { println((res.correctCount / res.count)); quest }
        else {
          quest.copy(is_complete = true)
        }

      case InRow1M =>
        if (res.time != 1 || res.maxInRow < quest.parameter) quest
        else {
          quest.copy(is_complete = true)
        }
      case InRow2M =>
        if (res.time != 2 || res.maxInRow < quest.parameter) quest
        else {
          quest.copy(is_complete = true)
        }

      case SumCorrect =>
        if (res.correctCount + quest.progress < quest.parameter)
          quest.copy(progress = (res.correctCount + quest.progress).toByte)
        else {
          quest.copy(is_complete = true)
        }

      case _ => quest
    }

}
