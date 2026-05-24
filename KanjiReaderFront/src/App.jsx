import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import MainMenu from './main/base/MainMenu.jsx'
import ListMenu from './main/options/ListMenu.jsx'
import ProfileMenu from './main/options/ProfileMenu.jsx'
import ErrorMenu from './main/base/ErrorMenu.jsx'
import GameSessionContainer from './main/game/GameSessionContainer.jsx'
import { useVocabulary } from './hooks/useVocabulary.js'
import { timeVars, vocs } from './main/config/lists.js'
import { getQuests, getStats, getUserData } from './hooks/BaseApi.js'
import './App.css'
import './index.css'

function AppRoutes({
  config, setConfig, user, setUser, result, setResult,
  gameLoadingTrigger, setGameLoadingTrigger, isMinDelayPassed, setIsMinDelayPassed,
  isReturningFromError, setIsReturningFromError, subMenuType, setSubMenuType,
  isSubMenuActive, setIsSubMenuActive, isMainMenuActive, setIsMainMenuActive,
  closeSubMenu, handleUpdateConfig, isAppLoading
}) {
  const navigate = useNavigate();

  // Локальный стейт, чтобы зафиксировать факт окончания самой первой загрузки приложения
  const [wasAppLoaded, setWasAppLoaded] = useState(false);

  useEffect(() => {
    if (!isAppLoading && !wasAppLoaded) {
      // Даем анимации ухода отработать (например, 600мс), затем полностью демонтируем этот слой
      const timer = setTimeout(() => {
        setWasAppLoaded(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAppLoading, wasAppLoaded]);

  const currentVocabName = vocs[config.wordList]?.name || 'WK51-55';
  const wordCount = config.gameTime * 50 + 50;

  const { data: words, loading: isVocabLoading, error: vocabError } = useVocabulary(
    currentVocabName,
    wordCount,
    gameLoadingTrigger
  );

  useEffect(() => {
    if (gameLoadingTrigger && !isVocabLoading && isMinDelayPassed && words && words.length > 0) {
      navigate('/game');
    }
  }, [words, gameLoadingTrigger, isVocabLoading, isMinDelayPassed, navigate]);

  const handleResetError = () => {
    setIsReturningFromError(true);
    setGameLoadingTrigger(false);
    setIsMainMenuActive(true);
  };

  const openTimerMenu = () => {
    setIsReturningFromError(false);
    setIsMainMenuActive(false);
    setSubMenuType('timer');
    setIsSubMenuActive(true);
  };

  const openVocabMenu = () => {
    setIsReturningFromError(false);
    setIsMainMenuActive(false);
    setSubMenuType('vocab');
    setIsSubMenuActive(true);
  };

  const openProfileMenu = () => {
    setIsReturningFromError(false);
    setIsMainMenuActive(false);
    setSubMenuType('profile');
    setIsSubMenuActive(true);
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      config.darkTheme ? 'dark' : 'light'
    );
  }, [config.darkTheme]);

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

  const vocabPercentages = Array.isArray(user.stats) ? user.stats : null;

  const handleMainMenuStartTrigger = () => {
    setIsReturningFromError(false);
    setIsMinDelayPassed(false);
    setGameLoadingTrigger(true);

    setTimeout(() => {
      setIsMinDelayPassed(true);
    }, 500);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="main-frame" style={{ position: 'relative', width: '100%' }}>
            {vocabError ? (
              <ErrorMenu error={vocabError} onBack={handleResetError} />
            ) : (
              <>
                {!isAppLoading && (
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
                    onStartTrigger={handleMainMenuStartTrigger}
                    isReturningFromError={isReturningFromError}
                  />
                )}

                {/* Пока приложуха грузится, показываем статичный слой */}
                {isAppLoading && (
                  <div className="game-root-container preloader-state" style={{ zIndex: 10, position: 'absolute' }}>
                    <span className="kanji-loading-display">読み込み中</span>
                  </div>
                )}

                {/* Как только загрузка завершилась, этот слой рендерится ОДИН РАЗ, улетает вправо и уничтожается стейтом wasAppLoaded */}
                {!isAppLoading && !wasAppLoaded && (
                  <div className="game-root-container preloader-state slide-out-pure-right" style={{ zIndex: 10, position: 'absolute' }}>
                    <span className="kanji-loading-display">読み込み中</span>
                  </div>
                )}

                {gameLoadingTrigger && (
                  <div className="game-root-container preloader-state slide-in-pure-bottom" style={{ zIndex: 10 }}>
                    <span className="kanji-loading-display">読み込み中</span>
                    <span className="game-text-english visible">Loading...</span>
                  </div>
                )}
              </>
            )}

            {subMenuType === 'timer' && (
              <ListMenu title="Time Limit" collec={timeVars} getter={config.gameTime} setter={handleSelectTimer} isActive={true} isPicked={isSubMenuActive} back={closeSubMenu} secondary={null} />
            )}
            {subMenuType === 'vocab' && (
              <ListMenu title="Vocabulary" collec={vocs} getter={config.wordList} setter={handleSelectVocab} isActive={true} isPicked={isSubMenuActive} back={closeSubMenu} secondary={vocabPercentages} />
            )}
            {subMenuType === 'profile' && (
              <ProfileMenu userData={user.data} quests={user.quests} vocs={vocs} isActive={true} isPicked={isSubMenuActive} back={closeSubMenu} theme={config.darkTheme} setTheme={handleSetTheme} updateConfig={handleUpdateConfig} goToMain={closeSubMenu} />
            )}
          </div>
        }
      />

      <Route
        path="/game"
        element={
          !gameLoadingTrigger || !words || words.length === 0 ? (
            <Navigate to="/" replace />
          ) : (
            <GameSessionContainer
              config={config}
              words={words}
              setResult={setResult}
              setUser={setUser}
              resetLoadingTrigger={() => {
                setGameLoadingTrigger(false);
                setIsReturningFromError(false);
                setIsMinDelayPassed(false);
              }}
            />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
    stats: []
  });

  const [subMenuType, setSubMenuType] = useState(null);
  const [isSubMenuActive, setIsSubMenuActive] = useState(false);
  const [isMainMenuActive, setIsMainMenuActive] = useState(true);

  const [gameLoadingTrigger, setGameLoadingTrigger] = useState(false);
  const [isReturningFromError, setIsReturningFromError] = useState(false);
  const [isMinDelayPassed, setIsMinDelayPassed] = useState(false);

  // Новый стейт для инициализации приложения
  const [isAppLoading, setIsAppLoading] = useState(true);

  const closeSubMenu = () => {
    setIsMainMenuActive(true);
    setIsSubMenuActive(false);
    setTimeout(() => {
      setSubMenuType(null);
    }, 100);
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
        } finally {
          setIsAppLoading(false);
          setIsMainMenuActive(true); // Включаем меню при успешном окончании загрузки
        }
      } else {
        setIsAppLoading(false);
        setIsMainMenuActive(true); // Включаем меню, если токена нет и загружать нечего
      }
    };
    initializeApp();
  }, []);

  return (
    <Router>
      <AppRoutes
        config={config} setConfig={setConfig}
        user={user} setUser={setUser}
        result={result} setResult={setResult}
        gameLoadingTrigger={gameLoadingTrigger} setGameLoadingTrigger={setGameLoadingTrigger}
        isMinDelayPassed={isMinDelayPassed} setIsMinDelayPassed={setIsMinDelayPassed}
        isReturningFromError={isReturningFromError} setIsReturningFromError={setIsReturningFromError}
        subMenuType={subMenuType} setSubMenuType={setSubMenuType}
        isSubMenuActive={isSubMenuActive} setIsSubMenuActive={setIsSubMenuActive}
        isMainMenuActive={isMainMenuActive} setIsMainMenuActive={setIsMainMenuActive}
        closeSubMenu={closeSubMenu} handleUpdateConfig={handleUpdateConfig}
        isAppLoading={isAppLoading}
      />
    </Router>
  );
}

export default App;