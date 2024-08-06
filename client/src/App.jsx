import { Routes, Route, useLocation } from 'react-router-dom';
import './App.scss'
import { useEffect } from 'react';

import { useAuthContext } from './contexts/authContext';

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
import NotFound from './components/not-found/NotFound';
import { TransitionProvider } from './contexts/transitionContext';
import TransitionComponent from './help-components/TransitionComponent';

function App() {
    const location = useLocation();
    const background = location.state && location.state.background;

    const { userType } = useAuthContext();
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="wrapper">
            <Header/>
            <div className="main">
                <TransitionProvider>
                    <Routes location={background || location}>
                        <Route index element={<TransitionComponent><Home /></TransitionComponent>}/>
                        <Route path="/about" element={<TransitionComponent><About /></TransitionComponent>} />
                        <Route path="/contact" element={<TransitionComponent><Contact /></TransitionComponent>} />
                        <Route path="/merch" element={<TransitionComponent><Merch /></TransitionComponent>}/>
                        <Route path="/Raffle" element={<TransitionComponent><Raffle /></TransitionComponent>}/>
                        <Route path="/about/singers/:singerName/:singerId/" element={<SingerDetails />}/>
                        <Route path='*' element={<TransitionComponent><NotFound/></TransitionComponent>}/>
                        <Route path="/logout" element={<Logout />}/>
                        { userType == 'user_admin' && 
                            <>
                                <Route path="merch/create-merch-item" element={<CreateMerchItem />} />
                                <Route path="merch/edit-merch-item/:merchItemID" element={<EditMerchItem />} />
                                <Route path="about/singers/:singerName/:singerId/edit-singer" element={<EditSinger />} />
                                <Route path="about/singers/add-singer" element={<AddSinger />} />
                            </>
                        }
                    </Routes>
                </TransitionProvider>
                { background && 
                    <Routes>
                        <Route path="login" element={<Login/>}/>
                        <Route path="register" element={<Register/>}/>
                        {userType == 'user_admin' && 
                            <>
                                <Route path="merch/create-merch-item" element={<CreateMerchItem />} />
                                <Route path="merch/edit-merch-item/:merchItemID" element={<EditMerchItem />} />
                                <Route path="about/singers/:singerName/:singerId/edit-singer" element={<EditSinger />} />
                                <Route path="about/singers/add-singer" element={<AddSinger />} />
                            </>
                        }
                    </Routes>
                }
            </div>
            <Footer/>
        </div>
    )
}

export default App
