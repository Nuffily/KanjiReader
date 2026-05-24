import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Game from './Game.jsx';
import { timeVars, vocs } from '../config/lists.js';
import { getQuests, getStats } from '../../hooks/BaseApi.js';

const GameSessionContainer = ({ config, words, setResult, setUser, resetLoadingTrigger }) => {
  const navigate = useNavigate();

  const rawTimeValue = timeVars[config.gameTime]?.name;
  const durationInSeconds = rawTimeValue === 0 ? 3600 : (rawTimeValue || 1) * 60;
  const currentVocabName = vocs[config.wordList]?.name || 'WK51-55';

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

export default GameSessionContainer;