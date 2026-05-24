import { useState, useEffect, useRef, useMemo } from 'react';
import "./Game.css";
import CountdownTimer from './CountDownTimer.jsx';
import { useGlobalKeyPress } from '../functions/ReactFuncs.jsx';
import ResultList from './ResultList.jsx';
import config from "../../config.js";
import { checkReading } from '../functions/JSFuncs.jsx';

const Game = ({ words = [], timerKey, duration, isGameGoes, count, voca, vocaNum, resultSetter, dataUpdate, theme, updateStats }) => {
  const [num, setNum] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState([]);
  const [flash, setFlash] = useState("neutral-pulse"); 
  const [forceEnd, setForceEnd] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // Состояние для уезда вверх

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const hasSentResult = useRef(false);

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

  useEffect(() => {
    if (!isGameFinished && !isWrong && inputRef.current) {
      inputRef.current.focus();
    }
  }, [num, isWrong, isGameFinished]);

  useEffect(() => {
    if (!isGameFinished && !isWrong && inputRef.current) {
      const timer = setTimeout(() => inputRef.current.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [isWrong, isGameFinished]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, []);

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

  // Вынесли закрытие с задержкой в отдельную функцию, чтобы не дублировать код
  const handleExitWithAnimation = () => {
    updateStats();
    setIsExiting(true); // Включаем анимацию уезда вверх
    
    setTimeout(() => {
      isGameGoes(false); // Закрываем полностью через 400мс
    }, 275);
  };

  useGlobalKeyPress({
    'Escape': (event) => {
      event.preventDefault();
      
      // Запоминаем результаты
      resultSetter({ correct: correctCount, total: isWrong ? num + 1 : num });

      if (!isGameFinished) {
        setForceEnd(true);
      } else {
        handleExitWithAnimation();
      }
    },
    'Enter': () => {
      if (!isGameFinished) {
        handleAnswerSubmit();
      } else {
        resultSetter({ correct: correctCount, total: num });
        handleExitWithAnimation();
      }
    }
  });

  const completedWords = words.slice(0, num + 1);
  const legacyAnswersArray = completedWords.map((_, idx) => {
    const record = answers.find(a => a.countAtAttempt === idx);
    return record ? record.correct : false;
  });

  const gameplayAnimationClass = isGameFinished ? 'slide-out-pure-left' : 'gameplay-active';
  
  // Динамически меняем класс: если выходим, то slide-out-up, иначе стандартное поведение
  const resultAnimationClass = isExiting 
    ? 'slide-out-up' 
    : (isGameFinished ? 'slide-in-blurred-right' : 'noMore');

  return (
    <div ref={containerRef} tabIndex={0} className="game-container-wrapper">
      
      {/* ИГРОВОЙ ПРОЦЕСС */}
      <div className={`game-root-container ${gameplayAnimationClass} ${flash}`}>
        <div className="game-timer-wrapper">
          <CountdownTimer
            resetKey={timerKey}
            time={duration}
            timeIsUp={(isUp) => isUp && setForceEnd(true)}
          />
        </div>

        <div className="kanji-altar">
          <p className={`game-text-furigana ${isWrong ? "visible" : "hidden"}`}>
            {isWrong ? words[num]?.furigana : ""}
          </p>

          <h1 className="kanji-main-display">{words[num]?.kanji}</h1>

          <p className={`game-text-english ${isWrong ? "visible" : "hidden"}`}>
            {isWrong ? words[num]?.english : ""}
          </p>
        </div>

        <div className="game-input-wrapper">
          <input
            className={theme ? 'occult-neon-input' : 'occult-neon-line'}
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isWrong}
            placeholder={isWrong ? "Press ENTER to skip" : "Type reading..."}
          />
        </div>
      </div>

      {/* ЭКРАН РЕЗУЛЬТАТОВ */}
      <div className={`game-root-container result-screen-active ${resultAnimationClass}`}>
        <h1 className="result-header">
          Result: {correctCount} <span className="slash-divider">/</span> {num}
        </h1>
        <ResultList items={completedWords} answers={legacyAnswersArray} />
      </div>

    </div>
  );
};

export default Game;