import { Routes, Route, useLocation } from 'react-router-dom';
import './App.scss'

import { AuthContextProvider } from './contexts/authContext';

import Header from './components/header/Header'
import Home from './components/home/Home'
import Login from './components/login/Login';
import About from './components/about/About';
import Register from './components/register/Register';
import Merch from './components/merch/Merch';
import Contact from './components/contact/Contact';
import Footer from './components/footer/Footer';
import CreateMerchItem from './components/merch/create-merch-item/CreateMerchItem';
import Logout from './components/logout/Logout';
import EditMerchItem from './components/merch/edit-merch-item/EditMerchItem';
import SingerDetails from './components/singer-details/Singer-Details';
import Raffle from './components/raffle/Raffle';
import EditSinger from './components/singer-details/edit-singer/EditSinger';
import AddSinger from './components/singers/add-singer/AddSinger';

function App() {
    const location = useLocation();
    const background = location.state && location.state.background;
    const isHome = location.pathname == "/" 

    return (
        <AuthContextProvider>
            <div className="wrapper">
                <Header/>
                <Routes location={background || location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/merch" element={<Merch />}/>
                    <Route path="/logout" element={<Logout />}/>
                    <Route path="/Raffle" element={<Raffle />}/>
                    <Route path="/about/singers/:singerName/:singerId" element={<SingerDetails />}/>
                </Routes>
                { background && (
                    <Routes>
                        <Route path="login" element={<Login/>}/>
                        <Route path="register" element={<Register/>}/>
                        <Route path="merch/create-merch-item" element={<CreateMerchItem />} />
                        <Route path="merch/edit-merch-item/:merchItemID" element={<EditMerchItem />} />
                        <Route path="about/singers/:singerName/:singerId/edit-singer" element={<EditSinger />} />
                        <Route path="about/singers/add-singer" element={<AddSinger />} />
                    </Routes>
                )}
                { !isHome && (
                    <Footer/>
                )}
            </div>
        </AuthContextProvider>
    )
}

export default App
