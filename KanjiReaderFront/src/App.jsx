import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import MainMenu from './main/base/MainMenu.jsx'
import ListMenu from './main/options/ListMenu.jsx'
import ProfileMenu from './main/options/ProfileMenu.jsx'
import Game from './main/game/Game.jsx' // Импорт нашей обновленной игры
import { timeVars, vocs } from './main/config/lists.js'
import './App.css'
import './index.css'
import { getQuests, getStats, getUserData } from './parts/Backend.js'

/* ==========================================================================
   ИГРОВОЙ ЭКРАН (Внутренний компонент, у которого есть доступ к useNavigate)
   ========================================================================== */
const GameSessionContainer = ({ config, setResult, setUser }) => {
  const navigate = useNavigate();

  // Рассчитываем чистые секунды. Если в конфиге 0 (без лимита), ставим заглушку (например, 1 час)
  const rawTimeValue = timeVars[config.gameTime]?.name;
  const durationInSeconds = rawTimeValue === 0 ? 3600 : (rawTimeValue || 1) * 60;
  
  const currentVocabName = vocs[config.wordList]?.name || 'WK51-55';

  const handleGameClose = () => {
    navigate('/'); // Безопасный редирект на главную
  };

  const handleRefreshStats = async () => {
    try {
      const [updatedQuests, updatedStats] = await Promise.all([
        getQuests(),
        getStats()
      ]);
      setUser(prev => ({
        ...prev,
        quests: updatedQuests || prev.quests,
        stats: updatedStats || prev.stats
      }));
    } catch (e) {
      console.error("Failed to sync stats after game session", e);
    }
  };

  return (
    <div className="main-frame" style={{ position: 'relative', width: '100%' }}>
      <Game
        timerKey={`game-session-${config.wordList}-${config.gameTime}`}
        duration={durationInSeconds}
        isGameGoes={handleGameClose}
        count={config.gameTime * 50 + 50} // Количество слов на раунд
        voca={currentVocabName}
        vocaNum={config.wordList}
        resultSetter={setResult}
        dataUpdate={handleRefreshStats}
        theme={config.darkTheme}
        updateStats={handleRefreshStats}
      />
    </div>
  );
};

/* ==========================================================================
   ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
   ========================================================================== */
function App() {
  const [rerender, setRerender] = useState(false);
  const [result, setResult] = useState({ correct: 0, total: 0 });

  const [config, setConfig] = useState({
    wordList: 0,
    gameTime: 1,
    darkTheme: true
  });

  const [user, setUser] = useState({
    data: {},
    quests: [],
    stats: {}
  });

  const [subMenuType, setSubMenuType] = useState(null);
  const [isSubMenuActive, setIsSubMenuActive] = useState(false);
  const [isMainMenuActive, setIsMainMenuActive] = useState(true);

  const openTimerMenu = () => {
    setIsMainMenuActive(false);
    setSubMenuType('timer');
    setIsSubMenuActive(true);
  };

  const openVocabMenu = () => {
    setIsMainMenuActive(false);
    setSubMenuType('vocab');
    setIsSubMenuActive(true);
  };

  const openProfileMenu = () => {
    setIsMainMenuActive(false);
    setSubMenuType('profile');
    setIsSubMenuActive(true);
  };

  const closeSubMenu = () => {
    setIsMainMenuActive(true);
    setIsSubMenuActive(false);
    setTimeout(() => {
      setSubMenuType(null);
    }, 100);
  };

  const handleSetTheme = (isDark) => {
    const updatedConfig = { ...config, darkTheme: isDark };
    setConfig(updatedConfig);
    localStorage.setItem('selectSelections', JSON.stringify(updatedConfig));
  };

  const handleSelectTimer = (index) => {
    const updatedConfig = { ...config, gameTime: index };
    setConfig(updatedConfig);
    localStorage.setItem('selectSelections', JSON.stringify(updatedConfig));
  };

  const handleSelectVocab = (index) => {
    const updatedConfig = { ...config, wordList: index };
    setConfig(updatedConfig);
    localStorage.setItem('selectSelections', JSON.stringify(updatedConfig));
  };

  const handleUpdateConfig = (newChanges) => {
    setConfig(prevConfig => {
      const updatedConfig = { ...prevConfig, ...newChanges };
      localStorage.setItem('selectSelections', JSON.stringify(updatedConfig));
      return updatedConfig;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('selectSelections');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get("code");
    const storedToken = localStorage.getItem("accessToken");

    const initializeApp = async () => {
      let currentToken = storedToken;
      if (codeParam && !storedToken) {
        try {
          const response = await fetch("/api/getAccessToken?code=" + codeParam);
          const data = await response.json();
          if (data.access_token) {
            localStorage.setItem("accessToken", data.access_token);
            currentToken = data.access_token;
            window.history.replaceState({}, document.title, "/");
          }
        } catch (e) {
          console.error("Failed to get token", e);
        }
      }

      if (currentToken) {
        try {
          const [userData, questsData, statsData] = await Promise.all([
            getUserData(),
            getQuests(),
            getStats()
          ]);

          setUser(prev => ({
            ...prev,
            data: userData || prev.data,
            quests: questsData || prev.quests,
            stats: statsData || prev.stats
          }));

          setRerender(prev => !prev);
        } catch (e) {
          console.error("Failed to load app data packages", e);
        }
      }
    };
    initializeApp();
  }, []);

  const vocabPercentages = vocs.map(v => user.stats?.[v.name] || null);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-frame" style={{ position: 'relative', width: '100%' }}>
              <MainMenu
                config={{
                  ...config,
                  wordList: vocs[config.wordList]?.title || "WaniKani",
                  gameTime: timeVars[config.gameTime]?.title || "No limit"
                }}
                user={user}
                result={result}
                onOpenTimer={openTimerMenu}
                onOpenVocab={openVocabMenu}
                onOpenProfile={openProfileMenu}
                isActive={isMainMenuActive}
              />

              {subMenuType === 'timer' && (
                <ListMenu
                  title="Time Limit"
                  collec={timeVars}
                  getter={config.gameTime}
                  setter={handleSelectTimer}
                  isActive={true}
                  isPicked={isSubMenuActive}
                  back={closeSubMenu}
                  secondary={null}
                />
              )}

              {subMenuType === 'vocab' && (
                <ListMenu
                  title="Vocabulary"
                  collec={vocs}
                  getter={config.wordList}
                  setter={handleSelectVocab}
                  isActive={true}
                  isPicked={isSubMenuActive}
                  back={closeSubMenu}
                  secondary={vocabPercentages}
                />
              )}

              {subMenuType === 'profile' && (
                <ProfileMenu
                  userData={user.data}
                  quests={user.quests}
                  vocs={vocs}
                  isActive={true}
                  isPicked={isSubMenuActive}
                  back={closeSubMenu}
                  theme={config.darkTheme}
                  setTheme={handleSetTheme}
                  updateConfig={handleUpdateConfig}
                  goToMain={closeSubMenu}
                />
              )}
            </div>
          }
        />

        {/* СЕССИЯ ИГРЫ ТЕПЕРЬ СВОБОДНО СЛУШАЕТ НАВИГАЦИЮ */}
        <Route
          path="/game"
          element={
            <GameSessionContainer
              config={config}
              setResult={setResult}
              setUser={setUser}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;