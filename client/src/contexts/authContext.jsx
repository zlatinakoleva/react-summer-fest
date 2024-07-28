import { createContext, useContext } from "react";
import usePersistedState from "../hook/usePersistedState";

export const AuthContext = createContext({
    email: '',
    accessToken: '',
    authType: "user_not_logged",
    changeAuthState: (authState = {}) => null
});

export function AuthContextProvider(props) {
    const [authState, setAuthState] = usePersistedState('auth',{})

    const changeAuthState = (state) => {
        localStorage.setItem('accessToken', state.accessToken)
        setAuthState(state)
    }

    console.log(authState.authType)
    
    const contextData = {
        email: authState.email,
        name: authState.username,
        accessToken: authState.accessToken,
        authType: !!authState.email,
        userType: authState.status || "user_not_logged",
        changeAuthState
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