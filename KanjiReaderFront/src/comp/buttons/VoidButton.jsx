import React from 'react';
import './VoidButton.css';

const VoidButton = ({ onClick, label = "始め" }) => {
  return (
    <div className="void-container">
      <button className="void-btnz" onClick={onClick}>
        <div className="void-glow"></div>
        
        {/* Сканирующая линия */}
        <div className="scan-line"></div>

        <div className="void-icon">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Внешний гексагон */}
            <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            {/* Внутренние линии связи */}
            <path d="M50 5V35M10 72.5L40 55M90 72.5L60 55" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
            {/* Ядро */}
            <rect x="44" y="46" width="12" height="12" transform="rotate(45 50 52)" fill="currentColor">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </rect>
            {/* Орбитальные точки */}
            <circle cx="50" cy="52" r="25" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="void-rings">
          <div className="v-ring v-inner"></div>
          <div className="v-ring v-outer"></div>
          <div className="v-ring v-glitch"></div>
        </div>
      </button>
      <span className="void-label">{label}</span>
    </div>
  );
};

export default VoidButton;