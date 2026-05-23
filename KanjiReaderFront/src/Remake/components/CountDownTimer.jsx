import { useEffect, useState } from 'react';

function CountdownTimer({ timeIsUp, time = 60, resetKey = 0 }) {
    const isInfinite = time === 0;

    const [timeLeft, setTimeLeft] = useState(isInfinite ? 0 : time);

    useEffect(() => {
        if (isInfinite) return;

        const storageKey = 'kanji_game_deadline';
        const metaKey = 'kanji_game_meta';

        const savedMeta = sessionStorage.getItem(metaKey);
        const savedDeadline = sessionStorage.getItem(storageKey);

        let deadline;

        if (savedMeta == resetKey && savedDeadline) {
            deadline = parseInt(savedDeadline, 10);
        } else {
            deadline = Date.now() + time * 1000;
            sessionStorage.setItem(storageKey, deadline);
            sessionStorage.setItem(metaKey, resetKey);
        }

        const tick = () => {
            const now = Date.now();
            const delta = Math.ceil((deadline - now) / 1000);

            if (delta <= 0) {
                setTimeLeft(0);
                timeIsUp?.(true);
            } else {
                setTimeLeft(delta);
            }
        };

        tick();

        const interval = setInterval(() => {
            const now = Date.now();
            if (now > deadline) {
                setTimeLeft(0);
                timeIsUp?.(true);
                clearInterval(interval);
            } else {
                tick();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [resetKey, time, isInfinite, timeIsUp]);

    const formatTime = (seconds) => {
        if (isInfinite) return ""
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div>
            <h2 style={{
                margin: "10px",
                fontSize: "200%",
                opacity: 0.6
            }}>{formatTime(timeLeft)}</h2>
        </div>
    );
}

export default CountdownTimer;