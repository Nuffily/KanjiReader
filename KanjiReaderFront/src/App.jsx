import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainMenu from './main/base/MainMenu.jsx'
import ListMenu from './main/options/ListMenu.jsx'
import ProfileMenu from './main/options/ProfileMenu.jsx' // Импортируем наш новый профиль
import { timeVars, vocs } from './main/config/lists.js'
import './App.css'
import './index.css'
import { getQuests, getStats, getUserData } from './parts/Backend.js'

function App() {
  const [rerender, setRerender] = useState(false);
  const [result, setResult] = useState({ correct: 0, total: 0 });

  // Конфиг игры
  const [config, setConfig] = useState({
    wordList: 0,
    gameTime: 1,
    darkTheme: true
  });

  // Данные пользователя
  const [user, setUser] = useState({
    data: {},
    quests: [],
    stats: {}
  });

  /* ==========================================================================
     УНИВЕРСАЛЬНАЯ ЛОГИКА ДЛЯ ПОДМЕНЮ (ТАЙМЕР, СЛОВАРЬ И ПРОФИЛЬ)
     ========================================================================== */
  // Хранит тип текущего контента в DOM: null, 'timer', 'vocab' или 'profile'
  const [subMenuType, setSubMenuType] = useState(null);

  // Флаг для запуска анимации прилета/улета (true = на экране, false = скрывается)
  const [isSubMenuActive, setIsSubMenuActive] = useState(false);

  // Флаг активности главного меню
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

  // Метод открытия профиля
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
    }, 600);
  };

  // Переключение темы (синхронизируем с конфигом)
  const handleSetTheme = (isDark) => {
    const updatedConfig = { ...config, darkTheme: isDark };
    setConfig(updatedConfig);
    localStorage.setItem('selectSelections', JSON.stringify(updatedConfig));
  };

  // Хэндлеры выбора
  const handleSelectTimer = (index) => {
    const updatedConfig = { ...config, gameTime: index };
    setConfig(updatedConfig);
    localStorage.setItem('selectSelections', JSON.stringify(updatedConfig));
  };

  const handleSelectVocab = (index) => {
    const updatedConfig = { ...config, wordList: index };
    console.log(index)
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

  /* ==========================================================================
     ЗАГРУЗКА И АВТОРИЗАЦИЯ
     ========================================================================== */
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
                onOpenProfile={openProfileMenu} // Передаем обработчик открытия профиля
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

              {/* Рендерим меню профиля */}
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

        <Route
          path="/game"
          element={
            <div className="game-placeholder">
              <h2>Gameplay Session</h2>
              <p style={{ opacity: 0.6 }}>Component coming soon...</p>
              <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                <span>Selected List: {vocs[config.wordList]?.name}</span> |
                <span> Duration: {timeVars[config.gameTime]?.name === 0 ? 'Infinite' : `${timeVars[config.gameTime]?.name}m`}</span>
              </div>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;