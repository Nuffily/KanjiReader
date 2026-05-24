import { useRef, useEffect } from 'react';
import './GameInput.css';

const GameInput = ({ value, onChange, disabled, isWrong, theme, wordIndex }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [disabled, wordIndex]); 

  return (
    <div className={`game-input-field-container ${disabled ? 'is-disabled' : ''} ${isWrong ? 'is-wrong' : ''}`}>
      <input
        ref={inputRef}
        type="text"
        className={`game-core-input ${theme ? 'theme-neon' : 'theme-minimal'}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={disabled ? "Press ENTER to skip" : "Type reading..."}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};

export default GameInput;