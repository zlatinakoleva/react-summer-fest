import { login, register, logout } from '../api/auth-api';
import { useAuthContext } from '../contexts/authContext';

export const useLogin = () => {
    const {changeAuthState} = useAuthContext();

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
    const {changeAuthState} = useAuthContext();

    const registerHandler = async (email, password) => {
        const {password: _, ...authData} = await register(email, password);
        
        console.log(authData)

        changeAuthState(authData);
        
        return authData;
    }

    return registerHandler;
}

export const useLogout = () => {
    const {logoutAuthState} = useAuthContext();
    
    const logoutHandler = async () => {
        logoutAuthState();
        await logout();
    }
    
    return logoutHandler;
}