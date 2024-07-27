import './CountDown.scss'
import { useState, useEffect } from 'react';

export default function CountDown() {
    const countdownDate = new Date('08/15/2024 10:30:00').getTime();
    const [timeStates, setTimeStates] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        setInterval(() => updateTime(), 1000)
    }, [])

    const updateTime = () => {
        if (countdownDate) {
            const currentTime = new Date().getTime();

            const distanceToDate = countdownDate - currentTime;

            let days = Math.floor(distanceToDate / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distanceToDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distanceToDate % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distanceToDate % (1000 * 60)) / 1000);

            days = `${days}`;
            
            if (hours < 10) {
                hours = `0${hours}`;
            }
            if (minutes < 10) {
                minutes = `0${minutes}`;
            }
            if (seconds < 10) {
                seconds = `0${seconds}`;
            }

            setTimeStates({ days, hours, minutes, seconds });
        }
    };

    return (
        <div className="countdown">
            <ul>
                <li>
                    <h2>{timeStates.days}</h2>
                    <p>Days</p>
                </li>
                <li>
                    <h2>{timeStates.hours}</h2>
                    <p>Hours</p>
                </li>
                <li>
                    <h2>{timeStates.minutes}</h2>
                    <p>Minutes</p>
                </li>
                <li>
                    <h2>{timeStates.seconds}</h2>
                    <p>Seconds</p>
                </li>
            </ul>
        </div>
    )
}