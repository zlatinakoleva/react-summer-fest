import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import './index.scss'
import { AuthContextProvider } from './contexts/authContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <React.StrictMode>
            <AuthContextProvider>
                <App />
            </AuthContextProvider>
        </React.StrictMode>
    </BrowserRouter>
)
