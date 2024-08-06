import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.scss'

import { useAuthContext } from './contexts/authContext';

import ErrorBoundary from './components/ErrorBoundary';
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
            <ErrorBoundary>
                <Header/>
                <div className="main">
                    <Routes location={background || location}>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/merch" element={<Merch />}/>
                        <Route path="/raffle" element={<Raffle />}/>
                        <Route path="/about/singers/:singerName/:singerId/" element={<SingerDetails />}/>
                        <Route path='*' element={<NotFound/>}/>
                        { userType != 'user_not_logged' && 
                            <Route path="/logout" element={<Logout />}/>
                        }
                        { userType == 'user_admin' && 
                            <>
                                <Route path="merch/create-merch-item" element={<CreateMerchItem />} />
                                <Route path="merch/edit-merch-item/:merchItemID" element={<EditMerchItem />} />
                                <Route path="about/singers/:singerName/:singerId/edit-singer" element={<EditSinger />} />
                                <Route path="about/singers/add-singer" element={<AddSinger />} />
                            </>
                        }
                    </Routes>
                </div>
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
                <Footer/>
            </ErrorBoundary>
        </div>
    )
}

export default App
