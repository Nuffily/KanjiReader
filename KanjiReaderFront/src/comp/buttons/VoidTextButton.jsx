import React from 'react';
import './VoidTextButton.css';

const VoidTextButton = ({ onClick, text = "ACTIVATE", label = "", className = "" }) => {
  return (
    <div className="void-text-container">
      <button className={`void-text-btn ${className}`} onClick={onClick}>
        {/* Свечение */}
        <div className="btn-glow"></div>
        
        {/* Сканирующая линия */}
        <div className="btn-scan-line"></div>
        
        {/* Текст кнопки (в центре) */}
        <span className="btn-text">{text}</span>
        
        {/* Декоративные рамки */}
        <div className="btn-rings">
          <div className="ring ring-inner"></div>
          <div className="ring ring-outer"></div>
          <div className="ring ring-glitch"></div>
        </div>
      </button>
      
      {/* Лейбл под кнопкой */}
      <span className="void-text-label">{label}</span>
    </div>
  );
};

export default VoidTextButton;