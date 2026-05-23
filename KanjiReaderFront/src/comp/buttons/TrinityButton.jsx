import React from 'react';
import './VoidButton.css';

const TrinityButton = ({ onClick, label = "" }) => {
  return (
    <div className="void-container">
      <button className="void-btnz" onClick={onClick}>
        <div className="void-glow"></div>
        
        {/* Сканирующая линия */}
        <div className="scan-line"></div>

        <div className="void-icon">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Внешний гексагон-рамка */}
            <path d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8"/>
            
            {/* Направляющие лучи к углам */}
            <g opacity="0.3" stroke="currentColor" strokeWidth="0.5">
               <path d="M50 5L50 30M10 27.5L30 40M90 27.5L70 40M10 72.5L30 60M90 72.5L70 60M50 95L50 70" />
            </g>

            {/* Группа с треугольниками */}
            <g className="trinity-group">
              {/* Основной треугольник */}
              <path d="M50 25L75 65H25L50 25Z" fill="none" stroke="currentColor" strokeWidth="1.5">
                <animateTransform attributeName="transform" type="rotate" from="0 50 55" to="360 50 55" dur="10s" repeatCount="indefinite" />
              </path>
              
              {/* Малый инвертированный треугольник (внутреннее ядро) */}
              <path d="M50 65L35 40H65L50 65Z" fill="currentColor">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="rotate" from="360 50 52" to="0 50 52" dur="5s" repeatCount="indefinite" />
              </path>
            </g>

            {/* Орбитальные кольца для геометрии */}
            <circle cx="50" cy="55" r="32" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.4" />
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

export default TrinityButton;