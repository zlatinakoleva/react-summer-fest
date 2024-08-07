import { memo, useEffect, useState, useRef } from 'react';
import { useAddWinner } from '../../../hook/useWinners';
import { useAuthContext } from '../../../contexts/authContext';

const Draw = memo(function Draw({
    participantsArr,
    stateChanger
}) {
    const { userType } = useAuthContext();
    const drawSpeed = 200;
    const addWinner = useAddWinner();
    const [awardsAmount, setAwardsAmount] = useState(3);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const [drawIndex, setDrawIndex] = useState(0);
    const participants = participantsArr || [];

    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
                setActiveIndex(prevTime => prevTime + 1);
                setDrawIndex(prevTime => (prevTime + 1) % participants.length);
            }, drawSpeed);
        }
    };

    const stopTimer = () => {
        if (isRunning) {
            setDrawIndex(activeIndex % participants.length);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setActiveIndex(0);
            setIsRunning(false);
            (async () => {
                setAwardsAmount(awardsAmount => awardsAmount - 1);
                await saveWinner();
            })();
        }
    };

    useEffect(() => {
        if (activeIndex >= participants.length) {
            setActiveIndex(0);
        }
    }, [activeIndex, participants.length]);

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    const saveWinner = async () => {
        const winner = participants[drawIndex];
        try {
            const result = await addWinner(winner);
            stateChanger({ type: 'ADD_WINNER', payload: result });
        } catch (err) {
            console.log(err);
        }
    };

    const safeIndex = drawIndex % participants.length;

    return (
        <>
            {awardsAmount > 0 && participants.length > 0 && (
                <div className="raffle">
                    {userType === "user_admin" && (
                        <>
                            <div className="raffle__content">
                                {isRunning 
                                    ? <h2>{participants[safeIndex]?.username || "No participant"}</h2>
                                    : <h2>Good Luck!</h2>
                                }
                            </div>
                            <div className="raffle__button">
                                {!isRunning ? (
                                    <button className="btn" onClick={startTimer}>
                                        <span>Start</span>
                                    </button>
                                ) : (
                                    <button className="btn" onClick={stopTimer}>
                                        <span>Stop</span>
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                    <div className="raffle__list">
                        <h4>Participating users:</h4>
                        <ul>
                            {participants.map(participant => (
                                <li key={participant._id}>
                                    <span>{participant.username}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
});

export default Draw;
