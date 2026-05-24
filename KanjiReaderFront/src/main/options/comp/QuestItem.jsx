import React from 'react';
import './QuestItem.css';

export function HighlightedDescription({ quest, vocs }) {
  const vocabTitle = vocs[quest.wordList - 1]?.title || '';
  const result = quest.description.replace('@', `@@@${vocabTitle}@@@`);
  const parts = result.split(/(@@@.*?@@@|\d+(?:\.\d+)?%?|%\d+(?:\.\d+)?)/);

  return (
    <div className="quest-description">
      {parts.map((part, index) => {
        if (part.startsWith('@@@') && part.endsWith('@@@')) {
          return (
            <span key={index} className="highlight">
              {part.slice(3, -3)}
            </span>
          );
        }
        if (/\d/.test(part) || /%\d/.test(part) || /\d%/.test(part)) {
          return (
            <span key={index} className="highlight">
              {part}
            </span>
          );
        }
        return part.trim() !== '' ? part : null;
      })}
    </div>
  );
}

export function questIcon(type) {
  switch (type) {
    case "CorrectPer1M":
    case "CorrectPer2M": return "時";
    case "Percent": return "率";
    case "InRow1M":
    case "InRow2M": return "列";
    case "CorrectSum": return "総";
    default: return "那";
  }
}

const QuestItem = ({ quest, vocs, onSelect }) => {
  const isCompleted = quest.isCompleted;
  const hasProgress = !isCompleted && quest.progress > 0;
  
  const questPercent = hasProgress
    ? Math.min(1, Math.max(0, quest.current / quest.progress))
    : 0;

  return (
    <div
      className={`profile-interactive-row ${isCompleted ? 'completed-task' : ''} ${hasProgress ? 'has-quest-progress' : ''}`}
      onClick={() => onSelect(quest)}
    >
      <div className="profile-quest-left">
        <span className="profile-quest-type-icon">{questIcon(quest.questType)}</span>
        <div className="profile-quest-text-content">
          <HighlightedDescription quest={quest} vocs={vocs} />
        </div>
      </div>

      {hasProgress && (
        <div className="profile-quest-progress-track">
          <div 
            className="profile-quest-progress-bar" 
            style={{ transform: `scaleX(${questPercent})` }} 
          />
        </div>
      )}
    </div>
  );
};

export default QuestItem;