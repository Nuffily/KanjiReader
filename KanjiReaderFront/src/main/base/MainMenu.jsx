import React, { useState, useEffect, useRef } from 'react';
import './MainMenu.css';
import TrinityButton from '../../comp/buttons/TrinityButton';

function MainMenu({ config, user, result, onOpenTimer, onOpenVocab, onOpenProfile, isActive, onStartTrigger, isReturningFromError }) {
  const [isStarting, setIsStarting] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isActive) {
      setIsStarting(false);
      isFirstRender.current = false;
    }
  }, [isActive]);

  const handleStartGame = () => {
    setIsStarting(true);
    onStartTrigger();
  };

  let animationClass = '';
  if (isStarting) {
    animationClass = 'slide-out-pure-top';
  } else if (isReturningFromError) {
    animationClass = 'slide-in-pure-top';
  } else {
    if (isActive) {
      animationClass = 'slide-in-pure-left';
    } else {
      animationClass = isFirstRender.current ? '' : 'slide-out-pure-left';
    }
  }

  return (
    <div className={`${animationClass} mainMenu`}>
      <h1>KanjiReader</h1>

      {result.total > 0 && (
        <div className="result-badge">
          SCORE: {result.correct} / {result.total}
        </div>
      )}

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