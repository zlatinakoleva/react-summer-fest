import { Link, useLocation } from "react-router-dom";
import './Header.scss'
import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";

export default function Header() {
    const location = useLocation();
    const {isAuthenticated, name} = useContext(AuthContext)
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
                    {!isAuthenticated &&
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
                    }

                    {isAuthenticated &&
                        <ul>
                            <li>
                                <p>{name}</p>
                            </li>
                            <li>
                                <Link to="/register" state={{ background: location }}>
                                    Logout
                                </Link>
                            </li>
                        </ul>
                    }
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