import { useState, useEffect, useRef, useMemo } from 'react';
import "./Game.css";
import CountdownTimer from './CountDownTimer.jsx';
import { useGlobalKeyPress } from '../functions/ReactFuncs.jsx';
import ResultList from './ResultList.jsx';
import config from "../../config.js";
import { checkReading } from '../functions/JSFuncs.jsx';

// Оставляем твой оригинальный хук без изменений логики
function useVocabulary(set = 'WK51-55', number = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/vocabulary/${set}/${number}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [set, number]);

  return { data, loading, error };
}

const Game = ({ timerKey, duration, isGameGoes, count, voca, vocaNum, resultSetter, dataUpdate, theme, updateStats }) => {
  const vocabularyParams = useMemo(() => ({ set: voca, number: count }), [voca, count]);
  const { data: words, loading, error } = useVocabulary(vocabularyParams.set, vocabularyParams.number);

  // --- СТЕЙТЫ И РЕФЫ ---
  const [num, setNum] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState([]);
  const [flash, setFlash] = useState("neutral-pulse"); // Новые оккультные анимации вместо ядовитых вспышек
  const [forceEnd, setForceEnd] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const hasSentResult = useRef(false);

  // --- ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ---
  const isWrong = useMemo(() => {
    return answers.some(ans => ans.countAtAttempt === num && !ans.correct);
  }, [answers, num]);

  const correctCount = useMemo(() => {
    return answers.filter(ans => ans.correct).length;
  }, [answers]);

  const isGameFinished = forceEnd || (words.length > 0 && num >= words.length && !isWrong);

  const getMaxStreak = (answersArray) => {
    let max = 0, current = 0;
    const uniqueAnswers = [];
    for (let i = 0; i < num; i++) {
      const ansForWord = answersArray.find(a => a.countAtAttempt === i);
      if (ansForWord) uniqueAnswers.push(ansForWord.correct);
    }
    for (const isCorrect of uniqueAnswers) {
      if (isCorrect) { current++; max = Math.max(max, current); }
      else { current = 0; }
    }
    return max;
  };

  // --- СИНХРОНИЗАЦИЯ С БЭКЕНДОМ ---
  const sendResult = async () => {
    if (hasSentResult.current) return;
    hasSentResult.current = true;

    const payload = {
      wordList: vocaNum + 1,
      time: duration / 60,
      count: num,
      correctCount: correctCount,
      maxInRow: getMaxStreak(answers)
    };

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch(`${config.apiUrl}/checkResult`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": "Bearer " + token },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Server error");
      const isLevelUpdated = await response.json();
      if (isLevelUpdated === true && dataUpdate) {
        await dataUpdate();
      }
    } catch (err) {
      console.error("Failed to sync game results:", err);
    }
  };

  useEffect(() => {
    if (isGameFinished) {
      sendResult();
    }
  }, [isGameFinished]);

  // Фокусировка инпута
  useEffect(() => {
    if (inputRef.current && !isWrong && !isGameFinished) inputRef.current.focus();
  }, [num, isWrong, isGameFinished]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, []);

  // --- ОБРАБОТКА ЛОГИКИ ВВОДА ---
  const handleAnswerSubmit = () => {
    setFlash("neutral-pulse");

    if (isWrong) {
      setInputValue("");
      setNum(prev => prev + 1);
    } else {
      const isCorrect = checkReading(inputValue, words[num].kanji, words[num].roman);

      if (isCorrect) {
        setAnswers(prev => [...prev, { correct: true, countAtAttempt: num }]);
        setFlash("correct-flash");
        setInputValue("");
        setNum(prev => prev + 1);
      } else {
        setAnswers(prev => [...prev, { correct: false, countAtAttempt: num }]);
        setFlash("incorrect-flash");
      }
    }
  };

  // --- УПРАВЛЕНИЕ КЛАВИШАМИ ---
  useGlobalKeyPress({
    'Escape': (event) => {
      event.preventDefault();
      resultSetter({ correct: correctCount, total: isWrong ? num + 1 : num });

      if (!isGameFinished) {
        setForceEnd(true);
      } else {
        updateStats();
        isGameGoes(false);
      }
    },
    'Enter': () => {
      if (!isGameFinished) {
        handleAnswerSubmit();
      } else {
        updateStats();
        resultSetter({ correct: correctCount, total: num });
        isGameGoes(false);
      }
    }
  });

  // Прелоадер в стиле твоего пустого экрана
  if (loading) return (
    <div className="game-root-container preloader-state">
      <span className="profile-kanji-pulse">字</span>
    </div>
  );

  if (error) return <div className="game-root-container error-state">Error: {error}</div>;

  if (isGameFinished) {
    // Обрезаем массив слов ровно до того индекса, до которого дошел игрок
    const completedWords = words.slice(0, num + 1);

    const legacyAnswersArray = completedWords.map((_, idx) => {
      const record = answers.find(a => a.countAtAttempt === idx);
      return record ? record.correct : false;
    });

    return (
      <div
        key="result-screen"
        ref={containerRef}
        tabIndex={0}
        className="game-root-container result-screen-active"
      >
        <h1 className="result-header">
          Result: {correctCount} <span className="slash-divider">/</span> {num}
        </h1>
        {/* Передаем только завершенные слова */}
        <ResultList items={completedWords} answers={legacyAnswersArray} />
      </div>
    );
  }

  // --- ИГРОВОЙ ПРОЦЕСС ---
  return (
    <div
      key={num}
      ref={containerRef}
      tabIndex={0}
      className={`game-root-container gameplay-active ${flash}`}
    >
      {/* Контейнер таймера в верхнем углу/центре */}
      <div className="game-timer-wrapper">
        <CountdownTimer
          resetKey={timerKey}
          time={duration}
          timeIsUp={(isUp) => isUp && setForceEnd(true)}
        />
      </div>

      {/* Основной алтарь кандзи */}
      <div className="kanji-altar">
        <p className={`game-text-furigana ${isWrong ? "visible" : "hidden"}`}>
          {isWrong ? words[num]?.furigana : ""}
        </p>

        <h1 className="kanji-main-display">{words[num]?.kanji}</h1>

        <p className={`game-text-english ${isWrong ? "visible" : "hidden"}`}>
          {isWrong ? words[num]?.english : ""}
        </p>
      </div>

      {/* Контейнер ввода */}
      <div className="game-input-wrapper">
        <input
          autoFocus={!isWrong}
          className={theme ? 'occult-neon-input' : 'occult-neon-line'}
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isWrong}
          placeholder={isWrong ? "Press ENTER to skip" : "Type reading..."}
        />
      </div>
    </div>
  );
};

export default Game;