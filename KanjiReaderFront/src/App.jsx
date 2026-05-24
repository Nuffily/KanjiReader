import { useEffect, useState, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import MainMenu from './main/base/MainMenu.jsx'
import ListMenu from './main/options/ListMenu.jsx'
import ProfileMenu from './main/options/ProfileMenu.jsx'
import ErrorMenu from './main/base/ErrorMenu.jsx'
import Game from './main/game/Game.jsx'
import { timeVars, vocs } from './main/config/lists.js'
import './App.css'
import './index.css'
import { getQuests, getStats, getUserData } from './parts/Backend.js'

// Изменения внутри функции useVocabulary:
function useVocabulary(set = 'WK51-55', number = 10, enabled = false) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setError(null);
      return;
    }

    const maxRetries = 3;
    const retryDelay = 2000;
    const timeoutDuration = 5000;
    let isMounted = true;
    let timeoutId = null;

    const fetchData = async () => {
      // ОЧИЩАЕМ старые слова перед новой загрузкой
      setData([]);
      setLoading(true);
      setError(null);

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        if (!isMounted) return;

        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

        try {
          const response = await fetch(`/api/vocabulary/${set}/${number}`, {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status >= 500) {
              throw new Error(`Internal server error occurred (Status: ${response.status}). Please try again later.`);
            } else if (response.status === 404) {
              throw new Error(`Requested vocabulary set "${set}" was not found on the server (Status: 404).`);
            } else if (response.status === 403 || response.status === 401) {
              throw new Error(`Access denied. Please check your authentication token (Status: ${response.status}).`);
            } else {
              throw new Error(`Unexpected server response (Status: ${response.status}).`);
            }
          }

          const result = await response.json();

          if (isMounted) {
            setData(result);
            setLoading(false);
            return;
          }
        } catch (err) {
          clearTimeout(timeoutId);

          let errorMessage = err.message;
          if (err.name === 'AbortError') {
            errorMessage = `Request timeout after ${timeoutDuration}ms. The server took too long to respond.`;
          } else if (err.message.includes('Failed to fetch')) {
            errorMessage = "Failed to connect to the server. Please verify your network connection or check if the backend is running.";
          }

          console.warn(`Attempt ${attempt}/${maxRetries} failed: ${errorMessage}`);

          if (attempt === maxRetries) {
            if (isMounted) {
              setError(`Failed to load data after ${maxRetries} attempts. ${errorMessage}`);
              setLoading(false);
            }
            return;
          }

          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [set, number, enabled]);

  return { data, loading, error };
}

// Изменения внутри GameSessionContainer:
const GameSessionContainer = ({ config, words, setResult, setUser, resetLoadingTrigger }) => {
  const navigate = useNavigate();

  const rawTimeValue = timeVars[config.gameTime]?.name;
  const durationInSeconds = rawTimeValue === 0 ? 3600 : (rawTimeValue || 1) * 60;

  const currentVocabName = vocs[config.wordList]?.name || 'WK51-55';

  // Генерируем уникальный ключ сессии при монтировании контейнера игры,
  // чтобы даже при одинаковых настройках sessionStorage сбрасывался.
  const uniqueTimerKey = useMemo(() => {
    return `game-session-${config.wordList}-${config.gameTime}-${Date.now()}`;
  }, [config.wordList, config.gameTime]);

  const handleGameClose = () => {
    resetLoadingTrigger();
    navigate('/');
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
        words={words}
        timerKey={uniqueTimerKey}
        duration={durationInSeconds}
        isGameGoes={handleGameClose}
        count={config.gameTime * 50 + 50}
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

  const [gameLoadingTrigger, setGameLoadingTrigger] = useState(false);
  const [shouldNavigateToGame, setShouldNavigateToGame] = useState(false);
  const [isReturningFromError, setIsReturningFromError] = useState(false);

  // Флаг минимальной задержки для прелоадера
  const [isMinDelayPassed, setIsMinDelayPassed] = useState(false);

  const currentVocabName = vocs[config.wordList]?.name || 'WK51-55';
  const wordCount = config.gameTime * 50 + 50;

  const { data: words, loading: isVocabLoading, error: vocabError } = useVocabulary(
    currentVocabName,
    wordCount,
    gameLoadingTrigger
  );

  // ЕДИНСТВЕННЫЙ И ПРАВИЛЬНЫЙ ЭФФЕКТ ДЛЯ НАВИГАЦИИ
  // (Старый эффект, который находился ниже и вызывал баг, полностью удален)
  useEffect(() => {
    if (gameLoadingTrigger && !isVocabLoading && isMinDelayPassed && words && words.length > 0) {
      setShouldNavigateToGame(true);
    }
  }, [words, gameLoadingTrigger, isVocabLoading, isMinDelayPassed]);

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

  const closeSubMenu = () => {
    setIsMainMenuActive(true);
    setIsSubMenuActive(false);
    setTimeout(() => {
      setSubMenuType(null);
    }, 100);
  };

  const handleSetTheme = (isDark) => {
    const updatedConfig = { ...config, darkTheme: isDark };
    const target = event.target;
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

  const handleMainMenuStartTrigger = () => {
    setIsReturningFromError(false);
    setIsMinDelayPassed(false);
    setGameLoadingTrigger(true);

    setTimeout(() => {
      setIsMinDelayPassed(true);
    }, 500);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            shouldNavigateToGame ? (
              <Navigate to="/game" replace />
            ) : (
              <div className="main-frame" style={{ position: 'relative', width: '100%' }}>
                {vocabError ? (
                  <ErrorMenu error={vocabError} onBack={handleResetError} />
                ) : (
                  <>
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

                    {gameLoadingTrigger && (
                      <div className="game-root-container preloader-state slide-in-pure-bottom" style={{ zIndex: 10 }}>
                        <h1 className="kanji-loading-display">読み込み中</h1>
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
            )
          }
        />

        <Route
          path="/game"
          element={
            // Если слов нет или загрузка не была инициирована через меню, 
            // отправляем пользователя на главную
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
                  setShouldNavigateToGame(false);
                  setIsReturningFromError(false);
                  setIsMinDelayPassed(false);
                }}
              />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;