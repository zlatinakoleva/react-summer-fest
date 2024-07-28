import { createContext, useContext } from "react";
import usePersistedState from "../hook/usePersistedState";

export const AuthContext = createContext({
    email: '',
    name: '',
    accessToken: '',
    authType: '',
    userType: '',
    changeAuthState: (authState = {}) => null,
    logoutAuthState: () => null
});

export function AuthContextProvider(props) {
    const [authState, setAuthState] = usePersistedState('auth',{})

    const changeAuthState = (state) => {
        localStorage.setItem('accessToken', state.accessToken)
        setAuthState(state)
    }

    const logoutAuthState = () => {
        setAuthState(null)
    }
    
    const contextData = {
        email: authState?.email,
        name: authState?.username,
        accessToken: authState?.accessToken,
        authType: !!authState?.email,
        userType: authState?.status || "user_not_logged",
        changeAuthState,
        logoutAuthState
    }

    return (
        <AuthContext.Provider value={contextData}>
            {props.children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const authData = useContext(AuthContext)
    return authData;
}