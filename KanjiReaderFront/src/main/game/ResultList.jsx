import React from "react";
import "./ResultList.css";

const ResultList = ({ items, answers }) => {
  const toRoman = (num) => {
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return roman[num] || num + 1;
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
                  <span className="result-item-number">{toRoman(index)}</span>
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