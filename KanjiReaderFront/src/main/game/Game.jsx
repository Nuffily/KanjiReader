import { useState, useEffect, useRef, useMemo } from 'react';
import "./Game.css";
import CountdownTimer from './CountDownTimer.jsx';
import { useGlobalKeyPress } from '../functions/ReactFuncs.jsx';
import ResultList from './ResultList.jsx';
import GameInput from '../../comp/input/GameInput.jsx';
import { checkReading } from '../functions/JSFuncs.jsx';
import { sendGameResult } from '../../hooks/BaseApi.js';

const Game = ({ words = [], timerKey, duration, isGameGoes, count, voca, vocaNum, resultSetter, dataUpdate, theme, updateStats }) => {
  const [num, setNum] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState([]);
  const [flash, setFlash] = useState("neutral-pulse");
  const [forceEnd, setForceEnd] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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

    const isLevelUpdated = await sendGameResult(payload);

    if (isLevelUpdated === true && dataUpdate) {
      await dataUpdate();
    }
  };

  useEffect(() => {
    if (isGameFinished) {
      sendResult();
    }
  }, [isGameFinished]);

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

  const handleExitWithAnimation = () => {
    updateStats();
    setIsExiting(true);

    setTimeout(() => {
      isGameGoes(false);
    }, 275);
  };

  useGlobalKeyPress({
    'Escape': (event) => {
      event.preventDefault();
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

  // Оптимизировали сборку массива ответов для ResultList через кэш-карту сложностью O(N) вместо O(N^2)
  const legacyAnswersArray = useMemo(() => {
    const answersMap = answers.reduce((acc, cur) => {
      acc[cur.countAtAttempt] = cur.correct;
      return acc;
    }, {});
    return completedWords.map((_, idx) => !!answersMap[idx]);
  }, [completedWords, answers]);

  const gameplayAnimationClass = isGameFinished ? 'slide-out-pure-left' : 'gameplay-active';
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

          {/* Добавляем key={num}. При смене слова анимация гарантированно запустится заново */}
          <h1 key={num} className="kanji-main-display">
            {words[num]?.kanji}
          </h1>

          <p className={`game-text-english ${isWrong ? "visible" : "hidden"}`}>
            {isWrong ? words[num]?.english : ""}
          </p>
        </div>

        <div className="game-input-wrapper">
          <GameInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isWrong}
            isWrong={flash === "incorrect-flash"}
            theme={theme}
            wordIndex={num}
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