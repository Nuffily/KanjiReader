import { useEffect, useState } from 'react';
import { getTimeRemaining } from '../functions/JSFuncs';

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