import { Link, useLocation } from "react-router-dom";
import './Header.scss'

export default function Header() {
    const location = useLocation();
    return (
        <>
            <div className="logo">
                <Link to="/">
                    <img src="../public/images/svg/concert.svg" alt="" />
                </Link>
            </div>
            
            <div className="header">
                <div></div>

                <div>
                    <ul>
                        <li>
                            <div className="weather-widget"></div>
                        </li>
                    </ul>
                </div>

                <div>
                    <ul>
                        <li>
                            <Link to="/login" state={{ background: location }}>
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link to="/register" state={{ background: location }}>
                                Register
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <ul>
                        <li>
                            <Link to="/about">
                                About Event
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <ul>
                        <li>
                            <Link to="/merch">
                                Merch
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <ul>
                        <li>
                            <Link to="/contact">
                                Contact
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}