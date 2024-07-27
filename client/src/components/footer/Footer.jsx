import { Link } from "react-router-dom";

import './Footer.scss'

export default function Footer() {
    return (
        <>
            <div className="footer">
                <div className="shell">
                    <div className="footer__inner">
                        <div className="footer__logo">
                            <Link to="/">
                                <img src="../public/images/svg/concert.svg" alt="" />
                            </Link>
                        </div>

                        <div className="footer__nav">
                            <ul>
                                <li>
                                    <a href="#">About</a>
                                </li>
                                <li>
                                    <a href="#">Merch</a>
                                </li>
                                <li>
                                    <a href="#">Contact</a>
                                </li>
                            </ul>
                        </div>                        
                        
                        <div className="socials">
                            <ul>
                                <li>
                                    <a href="">
                                        <img src="../public/images/svg/instagram.svg" alt="" />
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <img src="../public/images/svg/youtube.svg" alt="" />
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <img src="../public/images/svg/fb.svg" alt="" />
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="footer__copyright">
                            <p>© 2024 · Zlatina Koleva</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}