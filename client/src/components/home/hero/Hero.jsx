import './Hero.scss'
import CountDown from './count-down/CountDown'

export default function Hero() {
    return (
        <div className="hero">
            <div className="hero__background">
                <img src="../public/images/temp/fest-bg.png" alt="" />
            </div>
            <div className="shell">
                <div className="hero__inner">
                    <div className="hero__content">
                        <div className="hero__entry">
                            <h1>React Summer Fest</h1>
                            <h3>Join us for our annual summer festival on <br /><strong>August 15, 2024 from 10:30 AM.</strong></h3>
                        </div>

                        <div className="hero__counter">
                            <CountDown />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}