import React from "react";
import "./ResultList.css";

const ResultList = ({ items, answers }) => {
  // Функция для генерации римских цифр
  const toRoman = (num) => {
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return roman[num] || num + 1;
  };

  return (
    <div className="result-list-container slide-in-blurred-right">
      {items.length > 0 ? (
        <ul className="result-list-wrapper">
          {items.slice(0, answers.length).map((item, index) => {
            const isCorrect = answers[index];
            return (
              <li
                key={index}
                className={`result-item ${isCorrect ? "correct" : "incorrect"}`}
              >
                {/* Столбец 1: Римский номер + Кандзи */}
                <div className="item-left-side">
                  <span className="result-item-number">{toRoman(index)}</span>
                  <span className="kanji-text">{item.kanji}</span>
                </div>

                {/* Вертикальный адаптивный разделитель */}
                <div className="result-item-separator" />

                {/* Столбец 2: Чтение (Furigana) и Перевод (English) по горизонтали */}
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