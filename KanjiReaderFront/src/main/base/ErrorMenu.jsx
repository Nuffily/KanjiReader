import React from 'react';
import './MainMenu.css'; 
import VoidButton from '../../comp/buttons/VoidButton';

function ErrorMenu({ error, onBack }) {
  return (
    <div className="mainMenu">
      <h2 className="kanji-loading-display error-state">
        異常終了
      </h2>

      <div className="menu-text-container">
        <p className="error-text-message">
          {error || 'Unknown network error occurred'}
        </p>
      </div>

      <VoidButton className="start-btn" onClick={onBack} label={"戻 る"}>
        戻
      </VoidButton>
    </div>
  );
}

export default ErrorMenu;