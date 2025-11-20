import { useEffect } from "react";

export function useGlobalKeyPress(keyMap) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const handler = keyMap[event.key];
      if (handler) {
        handler(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyMap]);
}
