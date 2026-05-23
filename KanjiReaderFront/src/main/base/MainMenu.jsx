import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainMenu.css'; 
import TrinityButton from '../../comp/buttons/TrinityButton';

function MainMenu({ config, user, result, onOpenTimer, onOpenVocab, onOpenProfile, isActive }) {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game');
  };

  const animationClass = isActive ? 'slide-in-pure-left' : 'slide-out-pure-left';

  return (
    <div className={`${animationClass} mainMenu`}>
      <h1>KanjiReader</h1>

      <div
        className="result-badge"
        style={{ opacity: result.total > 0 ? 1 : 0 }}
      >
        SCORE: {result.correct} / {result.total}
      </div>

      <div className="menu-text-container">
        <p>
          Vocabulary: <a onClick={onOpenVocab}>{config.wordList}</a>
        </p>
        <p>
          Time Limit: <a onClick={onOpenTimer}>{config.gameTime}</a>
        </p>
        <p>
          Profile: <a onClick={onOpenProfile}>{user.data.login || "Guest"}</a>
        </p>
      </div>

      <TrinityButton className="start-btn" onClick={handleStartGame} label={"始 め"}>
        始
      </TrinityButton>
    </div>
  );
}

export default MainMenu;