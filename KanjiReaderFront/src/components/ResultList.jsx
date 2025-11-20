import "../css/ResultList.css"

const ResultList = ({ items, answers }) => {
  return (
    <div className="dark-scrollbar mainMenu result-list-container">
      <div className="result-list-wrapper">
        {items.slice(0, answers.length).map((item, index) => (
          <li
            key={index}
            className={`result-item ${answers[index] ? 'correct' : 'incorrect'}`}
          >
            <span className="kanji-text">{item.kanji}</span>
            <span className="result-text">{item.furigana}</span>
            <span className="result-text">{item.english}</span>
          </li>
        ))}
        {items.length === 0 && (
          <div className="empty-state">
            -
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultList;