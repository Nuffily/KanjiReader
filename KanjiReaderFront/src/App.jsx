import { useEffect, useState } from 'react'
import './css/App.css'
import Game from './components/game'
import ListMenu from './components/ListMenu'

const vocs = [
  { title: "WaniKani 11 - 15", name: "WK11-15" },
  { title: "WaniKani 16 - 20", name: "WK16-20" },
  { title: "WaniKani 21 - 25", name: "WK21-25" },
  { title: "WaniKani 26 - 30", name: "WK26-30" },
  { title: "WaniKani 31 - 35", name: "WK31-35" },
  { title: "WaniKani 36 - 40", name: "WK36-40" },
  { title: "WaniKani 41 - 45", name: "WK41-45" },
  { title: "WaniKani 46 - 50", name: "WK46-50" },
  { title: "WaniKani 51 - 55", name: "WK51-55" },
  { title: "WaniKani 56 - 60", name: "WK56-60" }
]

const timeVars = [
  { title: "1 min.", name: 1 },
  { title: "2 min.", name: 2 },
  { title: "3 min.", name: 3 },
  { title: "4 min.", name: 4 },
  { title: "No limit", name: 0 }
]

function App() {

  const [wordList, setWordList] = useState(0)
  const [gameTime, setGameTime] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('selectSelections');
    if (saved) {
      const selections = JSON.parse(saved);
      setWordList(selections.wordList);
      setGameTime(selections.gameTime);
    }
  }, []);

  useEffect(() => {
    const selections = { wordList, gameTime };
    localStorage.setItem('selectSelections', JSON.stringify(selections));
  }, [wordList, gameTime]);


  const [listPick, setListPick] = useState(false)

  const [submenu, setSubmenu] = useState(0)

  const [gameGoes, setGameGoes] = useState(false)

  const [result, setResult] = useState({ correct: 0, total: 0 })
  const [timerKey, setTimerKey] = useState(1)


  if (gameGoes) return (
    <Game
      timerKey={timerKey}
      duration={timeVars[gameTime].name * 60}
      resultSetter={setResult}
      isGameGoes={setGameGoes}
      count={(gameTime + 1) * 50}
      voca={vocs[wordList].name}
    />)


  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div className={submenu == 0 ? 'mainMenu' : (!listPick ? 'slide-in-blurred-left' : 'slide-out-blurred-left')}
        style={{
          position: 'absolute',
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
        <h1 style={{ margin: "20px" }}>KanjiReader</h1>

        <h2 style={{ margin: "0px", opacity: `${result.total == 0 ? "0" : "0.6"}` }}>Result: {result.correct} / {result.total} </h2>

        <div className="card">
          <p>
            Words: <a onClick={() => { setSubmenu(1); setListPick(!listPick) }} style={{ cursor: 'pointer' }}>{vocs[wordList].title}</a>
          </p>
          <p>
            Timer: <a onClick={() => { setSubmenu(2); setListPick(!listPick) }} style={{ cursor: 'pointer' }}>{timeVars[gameTime].title}</a>
          </p>

        </div>
        <button onClick={() => { setSubmenu(0); setTimerKey(n => n + 1); setGameGoes(true) }}>Play</button>
      </div>

      {submenu === 1 &&
        <ListMenu title={"Pick a list of words"} getter={wordList} setter={setWordList} isPicked={listPick} back={setListPick} collec={vocs} />
      }
      {submenu === 2 &&
        <ListMenu title={"Pick a game time"} getter={gameTime} setter={setGameTime} isPicked={listPick} back={setListPick} collec={timeVars} />
      }
    </div >
  )
}

export default App