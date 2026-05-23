// 1. Добавь импорт компонента Game в самом верху файла
import Game from './main/game/Game.jsx'; 
import { useNavigate } from 'react-router-dom';

// Создадим обертку для игрового роута, чтобы внутри нее работал хук useNavigate()
export default function GameRouteWrapper({ config, setResult, setUser, user }) {
  const navigate = useNavigate();

  // Извлекаем чистое время в секундах. 
  // Если в конфиге 0 (без лимита), даем заведомо большое число, например 3600 (1 час) или обрабатываем внутри таймера
  const durationInSeconds = (timeVars[config.gameTime]?.name || 1) * 60;

  // Безопасно вытаскиваем системное имя словаря для API запроса (например, 'WK51-55')
  const currentVocabName = vocs[config.wordList]?.name || 'WK51-55';

  // Функция, которая дергается при закрытии сессии (Escape / финиш)
  const handleGameClose = () => {
    navigate('/'); // Возвращаем пользователя на главную страницу
  };

  // Функция обновления глобального пакета данных пользователя (статистика в меню)
  const handleRefreshStats = async () => {
    try {
      const [updatedQuests, updatedStats] = await Promise.all([
        getQuests(),
        getStats()
      ]);
      setUser(prev => ({
        ...prev,
        quests: updatedQuests || prev.quests,
        stats: updatedStats || prev.stats
      }));
    } catch (e) {
      console.error("Failed to sync stats after game session", e);
    }
  };

  return (
    <div className="main-frame" style={{ position: 'relative', width: '100%' }}>
      <Game
        timerKey={`game-session-${config.wordList}-${config.gameTime}`} // Пересоздаст таймер при смене конфига
        duration={durationInSeconds}
        isGameGoes={handleGameClose} // Передаем редирект вместо простого флага false
        count={20} // Количество слов на сессию (можешь завязать на config, если добавишь в меню)
        voca={currentVocabName}
        vocaNum={config.wordList}
        resultSetter={setResult} // Записываем { correct, total } в стейт App
        dataUpdate={handleRefreshStats} // Обновляем базу при изменении левела
        theme={config.darkTheme} // Синхронизируем тему оформления инпута
        updateStats={handleRefreshStats} // Обновляем квесты и проценты
      />
    </div>
  );
}