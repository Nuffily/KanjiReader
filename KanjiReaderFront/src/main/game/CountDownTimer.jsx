import { useEffect, useState, useRef } from 'react';

function CountdownTimer({ timeIsUp, time = 60, resetKey = 0 }) {
    const isInfinite = time === 0;
    
    // Синхронизируем базовый стейт с новым пришедшим duration/time при смене resetKey
    const [timeLeft, setTimeLeft] = useState(isInfinite ? 0 : time);
    
    const timeIsUpRef = useRef(timeIsUp);
    useEffect(() => {
        timeIsUpRef.current = timeIsUp;
    }, [timeIsUp]);

    useEffect(() => {
        if (isInfinite) {
            setTimeLeft(0);
            return;
        }

        const storageKey = 'kanji_game_deadline';
        const metaKey = 'kanji_game_meta';

        const savedMeta = sessionStorage.getItem(metaKey);
        const savedDeadline = sessionStorage.getItem(storageKey);

        let deadline;

        if (savedMeta === String(resetKey) && savedDeadline && parseInt(savedDeadline, 10) > Date.now()) {
            deadline = parseInt(savedDeadline, 10);
            setTimeLeft(Math.ceil((deadline - Date.now()) / 1000));
        } else {
            deadline = Date.now() + time * 1000;
            sessionStorage.setItem(storageKey, deadline);
            sessionStorage.setItem(metaKey, resetKey);
            setTimeLeft(time); // Принудительно выставляем стартовое время
        }

        const cleanStorage = () => {
            sessionStorage.removeItem(storageKey);
            sessionStorage.removeItem(metaKey);
        };

        const tick = () => {
            const now = Date.now();
            const delta = Math.ceil((deadline - now) / 1000);

            if (delta <= 0) {
                setTimeLeft(0);
                cleanStorage();
                timeIsUpRef.current?.(true);
                return false;
            } else {
                setTimeLeft(delta);
                return true;
            }
        };

        const isRunning = tick();
        if (!isRunning) return;

        const interval = setInterval(() => {
            const shouldContinue = tick();
            if (!shouldContinue) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [resetKey, time, isInfinite]);

    const formatTime = (seconds) => {
        if (isInfinite) return "";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div>
            <h2 style={{ margin: "10px", fontSize: "200%", opacity: 0.6 }}>
                {formatTime(timeLeft)}
            </h2>
        </div>
    );
}

export default CountdownTimer;