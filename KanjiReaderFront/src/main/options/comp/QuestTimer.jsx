import { useEffect, useState } from 'react';


export function getTimeRemaining(targetDateString) {
    // Просто создаем Date из строки.
    // Браузер сам поймет, если там есть Z (UTC) или если там просто время (локальное).
    const targetDate = new Date(targetDateString);
    const now = Date.now();

    const diffMs = targetDate.getTime() - now;

    if (diffMs <= 0) {
        return "00:00:00";
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const format = (num) => String(num).padStart(2, '0');
    return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
}

const QuestTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

    useEffect(() => {
        if (!targetDate) return;

        const intervalId = setInterval(() => {
            setTimeLeft(getTimeRemaining(targetDate));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [targetDate]);

    return <span>{timeLeft}</span>;
};

export default QuestTimer