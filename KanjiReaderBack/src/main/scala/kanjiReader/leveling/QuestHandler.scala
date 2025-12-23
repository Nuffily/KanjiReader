package kanjiReader.leveling

import kanjiReader.kanjiUsers.UserRepo
import zio._
import QuestType._

object QuestHandler {

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

    case PercentIn1M =>
      PrintableQuest(
        "PercentIn1M",
        s"Enter ${quest.parameter}% correct answers with minimum sum answers ${quest.parameter2} in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )
    case PercentIn2M =>
      PrintableQuest(
        "PercentIn2M",
        s"Enter ${quest.parameter}% correct answers with minimum sum answers ${quest.parameter2} in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )

    case InRow1M =>
      PrintableQuest(
        "InRow1M",
        s"Enter ${quest.parameter} correct answers in row in one minute in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )
    case InRow2M =>
      PrintableQuest(
        "InRow2M",
        s"Enter ${quest.parameter} correct answers in row in two minutes in the collection @",
        0,
        0,
        quest.word_list,
        quest.is_complete
      )
    case SumCorrect =>
      PrintableQuest(
        "CorrectSum",
        s"Enter ${quest.parameter} correct answers in the collection @",
        quest.parameter,
        quest.progress,
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

      case PercentIn1M =>
        if (
          res.time != 1 || res.count < quest.parameter2 || (res.correctCount / res.count) * 100 < quest.parameter
        ) quest
        else {
          quest.copy(is_complete = true)
        }
      case PercentIn2M =>
        if (
          res.time != 2 || res.count < quest.parameter2 || (res.correctCount / res.count) * 100 < quest.parameter
        ) quest
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
