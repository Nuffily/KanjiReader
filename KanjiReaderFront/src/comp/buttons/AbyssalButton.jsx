import React from 'react';
import './VoidButton.css';

const AbyssalButton = ({ onClick, label = "G O I N G   D E E P E R" }) => {
  return (
    <div className="void-container">
      <button className="void-btnz" onClick={onClick}>
        <div className="void-glow"></div>
        <div className="scan-line"></div>

        <div className="void-icon">
          {/* СУЩЕСТВЕННО УВЕЛИЧЕННЫЙ VIEWBOX (было 120 120), ЧТОБЫ ВОССТАНОВИТЬ КРАЯ */}
          <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            
            {/* ГРУППА С ОПТИМАЛЬНЫМ МАСШТАБОМ (scale 1.6) И ЦЕНТРИРОВАНИЕМ В НОВОМ viewbox */}
            <g transform="translate(75, 75) scale(1.6) translate(-50, -50)">
              
              {/* Внешний ромб — теперь полностью цел */}
              <path d="M50 5L90 50L50 95L10 50L50 5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              
              <g className="shutter-group">
                {/* Вращающиеся лепестки */}
                <path d="M50 30L65 50L50 70L35 50L50 30Z" stroke="currentColor" strokeWidth="0.8" opacity="0.6">
                  <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
                </path>
                {/* Пунктирный ромб */}
                <path d="M50 18L80 50L50 82L20 50L50 18Z" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2" />
              </g>

              {/* Центральное Око (Зрачок) */}
              <circle cx="50" cy="50" r="11" fill="currentColor">
                <animate attributeName="r" values="10;12;10" dur="3s" repeatCount="indefinite" />
              </circle>
              
              {/* Орбита вокруг зрачка */}
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 2">
                 <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="4s" repeatCount="indefinite" />
              </circle>
            </g>
            
            {/* Перекрестие (Crosshair) — адаптировано под 150x150 viewbox */}
            <g opacity="0.4" stroke="currentColor" strokeWidth="0.6">
              <path d="M75 0V15M75 135V150M0 75H15M135 75H150" />
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

export default AbyssalButton;