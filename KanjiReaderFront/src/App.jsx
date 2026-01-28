import { useEffect, useState } from 'react'
import './css/App.css'
import Game from './components/Game'
import ListMenu from './components/ListMenu'
import ProfileMenu from './components/Profilemenu'
import { toDark, toLight } from './parts/Theme'
import { getQuests, getStats, getUserData } from './parts/Backend'

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

  const [rerender, setRerender] = useState(false);


  const [darkTheme, setDarkTheme] = useState(true);

  useEffect(() => {
    const root = document.documentElement;

    if (darkTheme) {
      toDark()
    } else {
      toLight()
    }
  }, [darkTheme]);


  const [userData, setUserData] = useState({});
  const [quests, setQuests] = useState({});
  const [stats, setStats] = useState({});

  useEffect(() => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString)
    const codeParam = urlParams.get("code")

    if (codeParam && (localStorage.getItem("accessToken") === null)) {

      console.log("no local")

      async function getAccessToken() {
        await fetch("http://localhost:8099/getAccessToken?code=" + codeParam, {
          method: "GET"
        }).then((response) => {
          return response.json();
        }).then((data) => {

          if (data.access_token) {
            localStorage.setItem("accessToken", data.access_token);
            getUserData(setUserData);
            getQuests(setQuests);
          }
          setRerender(!rerender);
        })
      }

      getAccessToken()
    }

    if (localStorage.getItem("accessToken")) {
      getUserData(setUserData);
      getQuests(setQuests);
      getStats(setStats);
    }

  }, []);


  const [wordList, setWordList] = useState(0)
  const [gameTime, setGameTime] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('selectSelections');
    if (saved) {
      const selections = JSON.parse(saved);
      setWordList(selections.wordList);
      setGameTime(selections.gameTime);
      setDarkTheme(selections.darkTheme);
    }
  }, []);

  useEffect(() => {
    const selections = { wordList, gameTime, darkTheme };
    localStorage.setItem('selectSelections', JSON.stringify(selections));
  }, [wordList, gameTime, darkTheme]);


  const [listPick, setListPick] = useState(false)

  const [submenu, setSubmenu] = useState(0)

  const [gameGoes, setGameGoes] = useState(false)

  const [result, setResult] = useState({ correct: 0, total: 0 })
  const [timerKey, setTimerKey] = useState(1)


  if (gameGoes) return (
    <Game
      theme={darkTheme}
      timerKey={timerKey}
      duration={timeVars[gameTime].name * 60}
      resultSetter={setResult}
      isGameGoes={setGameGoes}
      count={(gameTime + 1) * 50}
      voca={vocs[wordList].name}
      vocaNum={wordList}
      updateStats={() => getStats(setStats)}
      dataUpdate={() => {
        getUserData(setUserData);
        getQuests(setQuests);
      }}
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
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
        <h1 style={{ margin: "20px" }}>KanjiReader</h1>

        <h2 style={{ margin: "0px", opacity: `${result.total == 0 ? "0" : "0.3"}` }}>Result: {result.correct} / {result.total} </h2>

        <div className="card">
          <p>
            Words: <a onClick={() => { setSubmenu(1); setListPick(!listPick) }}>{vocs[wordList].title}</a>
          </p>
          <p>
            Timer: <a onClick={() => { setSubmenu(2); setListPick(!listPick) }}>{timeVars[gameTime].title}</a>
          </p>

          <p>
            Profile: <a onClick={() => { setSubmenu(3); setListPick(!listPick) }}>
              {userData.login || "Guest"}
            </a>
          </p>

        </div>
        <button onClick={() => { setSubmenu(0); setTimerKey(n => n + 1); setGameGoes(true) }}>始</button>
      </div>

      {submenu === 1 &&
        <ListMenu title={"Pick a list of words"} getter={wordList} secondary={stats} setter={setWordList} isPicked={listPick} back={setListPick} collec={vocs} />
      }
      {submenu === 2 &&
        <ListMenu title={"Pick a game time"} getter={gameTime} setter={setGameTime} isPicked={listPick} back={setListPick} collec={timeVars} />
      }
      {submenu === 3 &&
        <ProfileMenu userData={userData}
          theme={darkTheme}
          setTheme={setDarkTheme}
          quests={quests}
          vocs={vocs}
          isPicked={listPick}
          back={setListPick} />
      }
    </div >
  )
}

export default App