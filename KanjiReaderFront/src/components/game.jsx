import { useState, useEffect, useRef, useMemo } from 'react';
import "../css/game.css"
import "../css/App.css"
import CountdownTimer from './CountDownTimer';
import { useGlobalKeyPress } from './Some';
import ResultList from './ResultList';

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
          `http://localhost:8099/vocabulary/${set}/${number}`
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



const Game = ({ timerKey, duration, isGameGoes, count, voca, resultSetter }) => {

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

  useEffect(() => {
    if (inputRef.current && !wrong) {
      inputRef.current.focus();
    }
  }, [num]);

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useGlobalKeyPress({
    'Escape': (event) => {
      event.preventDefault();
      resultSetter({ correct: correct, total: num });
      if (!timeIsUp) {
        if (wrong) setNum(n => n + 1)
        setTimeIsUp(true)
      }
      else
        isGameGoes(false)
    },
    'Enter': () => setEnter(true)
  });



  if (loading) return (<div class="preloader main_cont" style={{
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <span class="spinner">字</span>
  </div>);

  if (error) return <div>Error: {error}</div>;



  if (!wrong && num >= words.length || timeIsUp) {

    if (!timeIsUp)
      setTimeIsUp(true)

    if (enter || num == 0) {
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
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: `${flash} 0.8s ease-out, ${flash.replace("Bg", "Text")} 0.8s ease-out`,
        }}
      >
        <h1 className='mainMenu'>Result: {correct} / {num}</h1>
        <ResultList items={words} answers={answers}></ResultList>
      </div>
    )
  }


  if (enter) {

    setFlash("neuturalBg")

    if (wrong) {
      setWrong(false)
      setNum(num + 1)
      setEnter(false)
      setInputValue("")
    }

    else {
      setWrong(words[num].roman !== inputValue)
      setEnter(false)

      if (words[num].roman === inputValue) {
        setNum(num + 1)
        setInputValue("")
        setFlash("correctBg")
        setCorrect(c => c + 1)
        setAnswers(a => [...a, true]);
      } else {
        setFlash("incorrectBg")
        setAnswers(a => [...a, false]);
      }
    }
  }

  return (
    <div
      key={num}
      ref={containerRef}
      tabIndex={0}
      className='main_cont'
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: `${flash} 0.8s ease-out, ${flash.replace("Bg", "Text")} 0.8s ease-out`,

      }}
    >
      <CountdownTimer
        resetKey={timerKey}
        time={duration}
        timeIsUp={(isUp) => {
          if (isUp) {
            setTimeIsUp(true)
          }
        }}
      />

      <p style={{
        fontSize: "40px",
        margin: "0px",
        opacity: `${wrong ? "1" : "0"}`,
      }}>{wrong ? words[num].furigana : " x"}</p>

      <h1 style={{
        margin: "10px",
        padding: "10px",
        fontSize: "6em",
        fontWeight: "550"
      }}>{words[num].kanji}</h1>

      <p style={{
        fontSize: "25px",
        margin: "0px",
        opacity: `${wrong ? "1" : "0"}`,
      }}>{wrong ? words[num].english : "x "}</p>
      <input autoFocus={!wrong} className="neon-input" ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={wrong}
        style={{
          fontSize: "25px",
          margin: "70px"
        }}
      ></input>

    </div>
  );
};

export default Game;