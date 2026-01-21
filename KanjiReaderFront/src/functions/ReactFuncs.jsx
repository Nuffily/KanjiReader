
export function HighlightedDescription({ quest, vocs }) {
  const vocabTitle = vocs[quest.wordList - 1]?.title || '';

  let result = quest.description.replace('@', `@@@${vocabTitle}@@@`);

  const parts = result.split(/(@@@.*?@@@|\d+(?:\.\d+)?%?|%\d+(?:\.\d+)?)/);

  return (
    <div className="quest-description">
      {parts.map((part, index) => {
        if (part.startsWith('@@@') && part.endsWith('@@@')) {
          const vocab = part.slice(3, -3);
          return (
            <span key={index} className="highlight">
              {vocab}
            </span>
          );
        } else if (/\d/.test(part) || /%\d/.test(part) || /\d%/.test(part)) {

          return (
            <span key={index} className="highlight">
              {part}
            </span>
          );
        } else if (part.trim() !== '') {

          return part;
        }
        return null;
      }).filter(Boolean)}
    </div>
  );
}