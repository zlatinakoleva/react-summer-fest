import { Link, useLocation } from "react-router-dom";
import './Header.scss'
import { useAuthContext } from "../../contexts/authContext";

export default function Header() {
    const location = useLocation();
    const {userType, name, email} = useAuthContext()
    console.log(userType)
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
                    
                    {userType == "user_not_logged"  &&
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

                    {userType != "user_not_logged" &&
                        <ul>
                            <li>
                                <p>
                                    {userType == "user_admin" && 
                                        <span>Admin - </span>
                                    }

                                    {name || email}
                                </p>
                            </li>
                            <li>
                                <Link to="/logout">
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