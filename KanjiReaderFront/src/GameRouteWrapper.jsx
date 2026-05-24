import Game from './main/game/Game.jsx'; 
import { useNavigate } from 'react-router-dom';

export default function GameRouteWrapper({ config, setResult, setUser, user }) {
  const navigate = useNavigate();

  const durationInSeconds = (timeVars[config.gameTime]?.name || 1) * 60;
  const currentVocabName = vocs[config.wordList]?.name || 'WK51-55';

  const handleGameClose = () => {
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
        timerKey={`game-session-${config.wordList}-${config.gameTime}`} 
        duration={durationInSeconds}
        isGameGoes={handleGameClose} 
        count={20} 
        voca={currentVocabName}
        vocaNum={config.wordList}
        resultSetter={setResult} 
        dataUpdate={handleRefreshStats} 
        theme={config.darkTheme} 
        updateStats={handleRefreshStats} 
      />
    </div>
  );
}