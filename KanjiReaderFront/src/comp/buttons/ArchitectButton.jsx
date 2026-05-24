import React from 'react';
import './VoidButton.css';

const ArchitectButton = ({ onClick, label = "D E C O D E   R E A L I T Y" }) => {
  return (
    <div className="void-container">
      <button className="void-btnz" onClick={onClick}>
        <div className="void-glow"></div>
        <div className="scan-line"></div>

        <div className="void-icon">
          <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            
            {/* Группа масштабирования */}
            <g transform="translate(75, 75) scale(1.5) translate(-50, -50)">
              
              {/* Основная звезда (два наложенных квадрата) */}
              <g stroke="currentColor" strokeWidth="0.8">
                <rect x="15" y="15" width="70" height="70" strokeLinejoin="round" />
                <rect x="15" y="15" width="70" height="70" transform="rotate(45 50 50)" strokeLinejoin="round" />
              </g>
              
              {/* Внутренние магические круги */}
              <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="15s" repeatCount="indefinite" />
              </circle>
              
              <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="1" />

              {/* Центральный механизм */}
              <g className="core-mechanism">
                {/* Вращающийся "компас" */}
                <path d="M50 35V42M50 58V65M35 50H42M58 50H65" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                   <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="5s" repeatCount="indefinite" />
                </path>
                
                {/* Ядро (Кристалл) */}
                <path d="M50 43L55 50L50 57L45 50L50 43Z" fill="currentColor">
                  <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                </path>
              </g>

              {/* Рунические точки по углам */}
              <g fill="currentColor" opacity="0.8">
                <circle cx="50" cy="10" r="1.5" />
                <circle cx="50" cy="90" r="1.5" />
                <circle cx="10" cy="50" r="1.5" />
                <circle cx="90" cy="50" r="1.5" />
              </g>
            </g>

            {/* Внешний технический интерфейс */}
            <g opacity="0.3" stroke="currentColor" strokeWidth="0.5">
              <circle cx="75" cy="75" r="70" strokeDasharray="1 10" />
              <path d="M75 5V15M75 135V145M5 75H15M135 75H145" />
            </g>
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

export default ArchitectButton;