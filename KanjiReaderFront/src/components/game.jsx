import { useState, useEffect, useRef, useMemo } from 'react';
import "../css/game.css"
import "../css/App.css"
import CountdownTimer from './CountDownTimer';
import { useGlobalKeyPress } from './Some';
import ResultList from './ResultList';
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
        const response = await fetch(
          `${config.apiUrl}/vocabulary/${set}/${number}`
        );

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



const Game = ({ timerKey, duration, isGameGoes, count, voca, vocaNum, resultSetter, dataUpdate, theme }) => {

  const vocabularyParams = useMemo(() => ({
    set: voca,
    number: count
  }), []);

  const { data: words, loading, error } = useVocabulary(
    vocabularyParams.set,
    vocabularyParams.number
  );

  const [num, setNum] = useState(0);
  const [answers, setAnswers] = useState([]);

  const [wrong, setWrong] = useState(false);
  const [enter, setEnter] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [flash, setFlash] = useState("neuturalBg");

  const [correct, setCorrect] = useState(0)
  const [timeIsUp, setTimeIsUp] = useState(false)

  const inputRef = useRef(null);
  const containerRef = useRef(null);



  const hasSentResult = useRef(false);

  const getMaxStreak = (answersArray) => {
    let max = 0;
    let current = 0;
    for (const isCorrect of answersArray) {
      if (isCorrect) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
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
      correctCount: correct,
      maxInRow: getMaxStreak(answers)
    };

    const token = localStorage.getItem("accessToken");

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
    const isFinished = timeIsUp || (!wrong && num >= words.length && words.length > 0);

    if (isFinished) {
      sendResult();
    }
  }, [timeIsUp, num, wrong, words.length]);



  useEffect(() => {
    if (inputRef.current && !wrong) inputRef.current.focus();
  }, [num, wrong]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, []);

  useGlobalKeyPress({
    'Escape': (event) => {
      event.preventDefault();
      resultSetter({ correct: correct, total: num });
      if (!timeIsUp) {
        if (wrong) setNum(n => n + 1)
        setTimeIsUp(true)
      } else isGameGoes(false)
    },
    'Enter': () => setEnter(true)
  });

  if (loading) return (
    <div className="preloader main_cont">
      <span className="spinner">字</span>
    </div>
  );

  if (error) return <div className="main_cont">Error: {error}</div>;

  // Экран завершения игры
  if ((!wrong && num >= words.length) || timeIsUp) {
    if (!timeIsUp) setTimeIsUp(true)

    if (enter || num === 0) {
      resultSetter({ correct: correct, total: num });
      isGameGoes(false);
    }

    return (
      <div
        key={num}
        ref={containerRef}
        tabIndex={0}
        className='mainMenu main_cont'
        style={{
          animation: `${flash} 0.8s ease-out, ${flash.replace("Bg", "Text")} 0.8s ease-out`,
        }}
      >
        <h1 className='mainMenu result-header'>Result: {correct} / {num}</h1>
        <ResultList items={words} answers={answers} />
      </div>
    )
  }

  // Enter
  if (enter) {
    setFlash("neuturalBg")
    if (wrong) {
      setWrong(false); setNum(num + 1); setEnter(false); setInputValue("")
    } else {
      // if (words[num].roman === inputValue) {
      if (checkReading(inputValue, words[num].kanji, words[num].roman)) {
        setNum(num + 1); setInputValue(""); setFlash("correctBg");
        setCorrect(c => c + 1); setAnswers(a => [...a, true]);
      } else {
        setWrong(true); setFlash("incorrectBg"); setAnswers(a => [...a, false]);
      }
      setEnter(false)
    }
  }


  return (
    <div
      key={num}
      ref={containerRef}
      tabIndex={0}
      className='main_cont'
      style={{
        animation: `${flash} 0.8s ease-out, ${flash.replace("Bg", "Text")} 1.8s ease-out`,
      }}
    >
      <CountdownTimer
        resetKey={timerKey}
        time={duration}
        timeIsUp={(isUp) => isUp && setTimeIsUp(true)}
      />

      <p className="game-text-furigana" style={{ opacity: wrong ? "1" : "0" }}>
        {wrong ? words[num].furigana : " x"}
      </p>

      <h1 className="kanji-main">{words[num].kanji}</h1>

      <p className="game-text-english" style={{ opacity: wrong ? "1" : "0" }}>
        {wrong ? words[num].english : "x "}
      </p>

      <input
        autoFocus={!wrong}
        // className="neon-input"
        className={theme ? 'neon-input' : "neon-line"}
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={wrong}
      />
    </div>
  );
};

export default Game;