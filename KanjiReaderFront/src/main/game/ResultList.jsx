import React from "react";
import "./ResultList.css";

const ResultList = ({ items, answers }) => {
  const toJapaneseNumber = (index) => {
    const num = index + 1;
    if (num <= 0 || num > 999) return num;

    const units = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    
    const hundredsDigit = Math.floor(num / 100);
    const tensDigit = Math.floor((num % 100) / 10);
    const unitsDigit = num % 10;

    let result = "";

    if (hundredsDigit > 0) {
      result += hundredsDigit === 1 ? "百" : units[hundredsDigit] + "百";
    }

    if (tensDigit > 0) {
      result += tensDigit === 1 ? "十" : units[tensDigit] + "十";
    }

    if (unitsDigit > 0) {
      result += units[unitsDigit];
    }

    return result;
  };

  return (
    <div className="result-list-container">
      {items.length > 0 ? (
        <ul className="result-list-wrapper">
          {items.slice(0, answers.length).map((item, index) => {
            const isCorrect = answers[index];
            const isLast = index === answers.length - 1;

            return (
              <li
                key={index}
                className={`result-item ${
                  isLast ? "neutral" : isCorrect ? "correct" : "incorrect"
                }`}
              >
                <div className="item-left-side">
                  <span className="result-item-number">{toJapaneseNumber(index)}</span>
                  <span className="kanji-text">{item.kanji}</span>
                </div>

                <div className="result-item-separator" />

                <div className="result-item-content">
                  <span className="result-text furigana">{item.furigana}</span>
                  <span className="result-text english">{item.english}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="result-empty-state">
          <span className="profile-kanji-pulse">虚</span>
          <p className="empty-text">No data recorded in this session</p>
        </div>
      )}
    </div>
  );
};

export default ResultList;