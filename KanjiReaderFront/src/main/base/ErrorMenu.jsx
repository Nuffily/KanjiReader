import React from 'react';
import './MainMenu.css'; 
import VoidButton from '../../comp/buttons/VoidButton';

function ErrorMenu({ error, onBack }) {
  return (
    <div className="mainMenu">
      <h2 className="kanji-loading-display" style={{ color: 'var(--red-color)' }}>
        異常終了
      </h2>

      <div className="menu-text-container" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '80%', margin: '0 auto' }}>
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