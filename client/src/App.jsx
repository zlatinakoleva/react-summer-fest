import { Routes, Route, useLocation } from 'react-router-dom';
import './App.scss'
import Header from './components/header/Header'
import Home from './components/home/Home'
import Login from './components/login/Login';
import About from './components/about/About';
import Register from './components/register/Register';
import Merch from './components/merch/Merch';
import Contact from './components/contact/Contact';
import Footer from './components/footer/Footer';

function App() {
    const location = useLocation();
    const background = location.state && location.state.background;
    const isHome = location.pathname == "/" 

    return (
        <div className="wrapper">
            <Header/>
            <Routes location={background || location}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/merch" element={<Merch />} />
            </Routes>
            { background && (
                <Routes>
                    <Route path="login" element={<Login/>}/>
                    <Route path="register" element={<Register/>}/>
                </Routes>
            )}
            { !isHome && (
                <Footer/>
            )}
        </div>
    )
}

export default App
