import { useEffect, useState } from 'react'
import './css/App.css'
import Game from './components/game'
import ListMenu from './components/ListMenu'
import ProfileMenu from './components/Profilemenu'

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
  const [userData, setUserData] = useState({});
  const [quests, setQuests] = useState({});

  const [darkTheme, setDarkTheme] = useState(true);

  useEffect(() => {
    // Изменяем CSS переменные
    const root = document.documentElement;

    if (darkTheme) {

      document.body.style.backgroundColor = '#242424';
      document.body.style.color = '#d2d9ebec';
      root.style.setProperty('--background-color', '#242424');

      root.style.setProperty('--text-color', '#f6f1f8ec');
      root.style.setProperty('--red-color', '#c00c75');
      root.style.setProperty('--redder-color', '#fa0092');

      root.style.setProperty('--second-back', '#333');
      root.style.setProperty('--list-gradient', 'linear-gradient(145deg, #242424, #1a1a1a)');

      root.style.setProperty('--incorrect-text', 'rgba(253, 220, 220, 0.87)');
      root.style.setProperty('--correct-text', 'rgba(220, 253, 223, 0.87)');

      root.style.setProperty('--incorrect-back', '#402424');
      root.style.setProperty('--correct-back', '#244424');
      root.style.setProperty('--neutural-back', '#242430');

      root.style.setProperty('--result-border', '#374151');
      root.style.setProperty('--item-correct', '#1a2e1a');
      root.style.setProperty('--item-incorrect', '#2e1a1a');

      root.style.setProperty('--text-correct', '#4ade80');
      root.style.setProperty('--text-incorrect', '#f87171');

      root.style.setProperty('--button-color', '#1f1f1f');
      root.style.setProperty('--button-text', 'rgba(221, 215, 219, 0.445)');
    } else {

      document.body.style.backgroundColor = '#FDF5D7';
      document.body.style.color = '#333333';
      root.style.setProperty('--background-color', '#FDF5D7');

      root.style.setProperty('--text-color', '#333333');
      root.style.setProperty('--red-color', '#c50404');
      root.style.setProperty('--redder-color', '#ff2f2f');

      // root.style.setProperty('--second-back', '#f0cbcb');
      root.style.setProperty('--second-back', '#dfd8c0');
      root.style.setProperty('--list-gradient', 'linear-gradient(145deg, #e6e2d6, #e7dcb1)');

      root.style.setProperty('--incorrect-text', '#312c2c');
      root.style.setProperty('--correct-text', '#363d38');

      root.style.setProperty('--incorrect-back', '#f3d9cf');
      root.style.setProperty('--correct-back', '#e2fcca');
      root.style.setProperty('--neutural-back', '#e6e0cc');

      root.style.setProperty('--result-border', '#9c998d00');
      root.style.setProperty('--item-correct', '#b5fab5');
      root.style.setProperty('--item-incorrect', '#e4afaf');

      root.style.setProperty('--text-correct', '#395a39');
      root.style.setProperty('--text-incorrect', '#533434');

      root.style.setProperty('--button-color', '#dfd8c0');
      root.style.setProperty('--button-text', 'rgba(41, 41, 41, 0.69)');

    }
  }, [darkTheme]);

  async function getUserData() {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch("http://localhost:8099/getKanjiUserData", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      if (!response.ok || response.status === 401) {

        console.error("Unauthorized (401): Token expired or invalid");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");

        return;

      }

      const data = await response.json();
      console.log(data);
      setUserData(data);

    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }

  async function getQuests() {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch("http://localhost:8099/getQuests", {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      if (!response.ok || response.status === 401) {

        console.error("Unauthorized (401): Token expired or invalid");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");

        return;

      }

      const data = await response.json();
      console.log(data);
      setQuests(data);

    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }

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
            getUserData();
            getQuests();
          }
          setRerender(!rerender);
        })
      }

      getAccessToken()
    }

    if (localStorage.getItem("accessToken")) {
      getUserData();
      getQuests();
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
      dataUpdate={() => {
        getUserData();
        getQuests();
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
        <ListMenu title={"Pick a list of words"} getter={wordList} setter={setWordList} isPicked={listPick} back={setListPick} collec={vocs} />
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