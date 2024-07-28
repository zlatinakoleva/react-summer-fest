import { createContext, useState, useContext } from "react";

export const AuthContext = createContext({
    email: '',
    accessToken: '',
    isAuthenticated: false,
    changeAuthState: (authState = {}) => null
});

export function AuthContextProvider(props) {
    const [authState, setAuthState] = useState({})
    const changeAuthState = (state) => {
        localStorage.setItem('accessToken', state.accessToken)
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
            {props.children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const authData = useContext(AuthContext)
    return authData;
}