import { memo, useEffect, useState, useRef } from 'react';
import { useAddWinner } from '../../../hook/useWinners';
import { useAuthContext } from '../../../contexts/authContext';


const Draw = memo( function Draw({
    participantsArr,
    stateChanger
}) {
    const {userType} = useAuthContext();
    const drawSpeed = 200;
    const addWinner = useAddWinner();
    const [awardsAmount, setAwardsAmount] = useState(3);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    const [drawIndex, setDrawIndex] = useState(0);
    const participants = participantsArr;

    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
                setActiveIndex(prevTime => prevTime + 1);
                setDrawIndex(prevTime => prevTime + 1)
            }, drawSpeed);
        }
    };

    const stopTimer = () => {
        if (isRunning) {
            setDrawIndex(activeIndex)
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setActiveIndex(0);
            setIsRunning(false);
            setTimeout(function(){
                setAwardsAmount(awardsAmount => awardsAmount - 1)
                saveWinner()
            },1000)
        }
    };

    useEffect(() => {
        if (activeIndex == participants.length - 1) {
            setTimeout(function(){
                setActiveIndex(0);
                setDrawIndex(0)
            },drawSpeed)
        }
    }, [activeIndex]);

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);
    
    const saveWinner = async () => {
        const winner = participants[drawIndex];
        try {
            const result = await addWinner(winner);
            stateChanger({type: 'ADD_WINNER', payload: result})
        } catch (err){
            console.log(err)
        }
    }

    return (
        <>
            { awardsAmount > 0
                && <div className="raffle">
                    {userType == "user_admin" && 
                        <>
                            <div className="raffle__content">
                                <p>{participants[drawIndex]?.username}</p>
                            </div>

                            <div className="raffle__button">
                                {!isRunning
                                    ? <button className="btn" onClick={startTimer}>
                                        <span>Start</span>
                                    </button>
                                    : <button className="btn" onClick={stopTimer}>
                                        <span>Stop</span>
                                    </button>
                                }
                            </div>
                        </>
                    }

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
            }
        </>
    )
});

export default Draw;