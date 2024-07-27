import { useContext } from 'react';
import { login, register } from '../api/auth-api';
import { AuthContext } from '../contexts/authContext';

export const useLogin = () => {
    const {changeAuthState} = useContext(AuthContext);

    const loginHandler = async (email, password) => {
        try {
            const {password: _, ...authData} = await login(email, password)

            changeAuthState(authData)
        } catch (err) {
            console.log(err.message)
        }
    }

    return loginHandler;
}

export const useRegister = () => {
    const {changeAuthState} = useContext(AuthContext);

    const registerHandler = async (email, password) => {
        const {password: _, ...authData} = await register(email, password);

        changeAuthState(authData);
        
        return authData;
    }

    return registerHandler;
}