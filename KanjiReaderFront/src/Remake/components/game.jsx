import { useState, useEffect, useRef, useMemo } from 'react';
import "../css/Game.css"
import "../css/App.css"
import CountdownTimer from './CountDownTimer.jsx';
import { useGlobalKeyPress } from '../functions/ReactFuncs.jsx';
import ResultList from './ResultList.jsx';
import config from "../config.js"
import { checkReading } from '../functions/JSFuncs.jsx';

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
  const vocabularyParams = useMemo(() => ({ set: voca, number: count }), []);
  const { data: words, loading, error } = useVocabulary(vocabularyParams.set, vocabularyParams.number);

  // --- МИНИМИЗИРОВАННЫЙ СТЕЙТ ---
  const [num, setNum] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState([]); // Массив объектов: { correct: boolean, countAtAttempt: number }
  const [flash, setFlash] = useState("neuturalBg");
  const [forceEnd, setForceEnd] = useState(false); // Для досрочного выхода по Esc или таймеру

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const hasSentResult = useRef(false);

  // --- ВЫЧИСЛЯЕМЫЕ СВОЙСТВА (Deriving State) ---
  // Определяем, была ли совершена ошибка на текущем слове
  const isWrong = useMemo(() => {
    return answers.some(ans => ans.countAtAttempt === num && !ans.correct);
  }, [answers, num]);

  // Считаем общее количество уникально правильных ответов
  const correctCount = useMemo(() => {
    return answers.filter(ans => ans.correct).length;
  }, [answers]);

  // Проверяем, завершена ли игра
  const isGameFinished = forceEnd || (words.length > 0 && num >= words.length && !isWrong);

  const getMaxStreak = (answersArray) => {
    let max = 0, current = 0;
    // Берем только уникальные исходы для каждого индекса слова
    const uniqueAnswers = [];
    for(let i = 0; i < num; i++) {
      const ansForWord = answersArray.find(a => a.countAtAttempt === i);
      if (ansForWord) uniqueAnswers.push(ansForWord.correct);
    }
    for (const isCorrect of uniqueAnswers) {
      if (isCorrect) { current++; max = Math.max(max, current); }
      else { current = 0; }
    }
    return max;
  };

  // --- ОТПРАВКА РЕЗУЛЬТАТОВ ---
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

  // Фокусы инпута
  useEffect(() => {
    if (inputRef.current && !isWrong && !isGameFinished) inputRef.current.focus();
  }, [num, isWrong, isGameFinished]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, []);

  // --- ЛОГИКА ПРОВЕРКИ ОТВЕТА (Вместо стейта enter) ---
  const handleAnswerSubmit = () => {
    setFlash("neuturalBg");

    if (isWrong) {
      // Если уже была ошибка, по кнопке Enter просто скипаем слово
      setInputValue("");
      setNum(prev => prev + 1);
    } else {
      // Проверяем ввод
      const isCorrect = checkReading(inputValue, words[num].kanji, words[num].roman);
      
      if (isCorrect) {
        setAnswers(prev => [...prev, { correct: true, countAtAttempt: num }]);
        setFlash("correctBg");
        setInputValue("");
        setNum(prev => prev + 1);
      } else {
        setAnswers(prev => [...prev, { correct: false, countAtAttempt: num }]);
        setFlash("incorrectBg");
      }
    }
  };

  // --- ГЛОБАЛЬНЫЕ КЛАВИШИ ---
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

  if (loading) return (
    <div className="preloader main_cont">
      <span className="spinner">字</span>
    </div>
  );

  if (error) return <div className="main_cont">Error: {error}</div>;

  // --- ЭКРАН ЗАВЕРШЕНИЯ ИГРЫ ---
  if (isGameFinished) {
    // Адаптируем массив ответов под старый ResultList, чтобы ничего не поломать внутри него
    const legacyAnswersArray = words.map((_, idx) => {
      const record = answers.find(a => a.countAtAttempt === idx);
      return record ? record.correct : false;
    });

    return (
      <div
        key="result-screen"
        ref={containerRef}
        tabIndex={0}
        className='mainMenu main_cont'
        style={{
          animation: `${flash} 0.8s ease-out, ${flash.replace("Bg", "Text")} 0.8s ease-out`,
        }}
      >
        <h1 className='mainMenu result-header'>Result: {correctCount} / {num}</h1>
        <ResultList items={words} answers={legacyAnswersArray} />
      </div>
    )
  }

  // --- ИГРОВОЙ ПРОЦЕСС ---
  return (
    <div
      key={num}
      ref={containerRef}
      tabIndex={0}
      className='main_cont'
      style={{
        animation: `${flash} 0.8s ease-out, ${flash.replace("Bg", "Text")} 0.8s ease-out`,
      }}
    >
      <CountdownTimer
        resetKey={timerKey}
        time={duration}
        timeIsUp={(isUp) => isUp && setForceEnd(true)}
      />

      <p className="game-text-furigana" style={{ opacity: isWrong ? "1" : "0" }}>
        {isWrong ? words[num]?.furigana : " x"}
      </p>

      <h1 className="kanji-main">{words[num]?.kanji}</h1>

      <p className="game-text-english" style={{ opacity: isWrong ? "1" : "0" }}>
        {isWrong ? words[num]?.english : "x "}
      </p>

      <input
        autoFocus={!isWrong}
        className={theme ? 'neon-input' : "neon-line"}
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isWrong}
      />
    </div>
  );
};

export default Game;