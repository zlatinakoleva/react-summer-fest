import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.scss'

import { AuthContext } from './contexts/authContext';

import Header from './components/header/Header'
import Home from './components/home/Home'
import Login from './components/login/Login';
import About from './components/about/About';
import Register from './components/register/Register';
import Merch from './components/merch/Merch';
import Contact from './components/contact/Contact';
import Footer from './components/footer/Footer';
import CreateMerchItem from './components/merch/create-merch-item/CreateMerchItem';


function App() {
    const location = useLocation();
    const background = location.state && location.state.background;
    const isHome = location.pathname == "/" 

    const [authState, setAuthState] = useState({})
    const changeAuthState = (state) => {
        setAuthState(state)
    }
    const contextData = {
        email: authState.email,
        name: authState.username,
        accessToken: authState.accessToken,
        isAuthenticated: !!authState.email,
        changeAuthState
    }

    return (
        <AuthContext.Provider value={contextData}>
            <div className="wrapper">
                <Header/>
                <Routes location={background || location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/merch" element={<Merch />}/>
                </Routes>
                { background && (
                    <Routes>
                        <Route path="login" element={<Login/>}/>
                        <Route path="register" element={<Register/>}/>
                        <Route path="merch/create-merch-item" element={<CreateMerchItem />} />
                    </Routes>
                )}
                { !isHome && (
                    <Footer/>
                )}
            </div>
        </AuthContext.Provider>
    )
}

export default App
