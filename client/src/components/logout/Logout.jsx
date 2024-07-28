import { Navigate } from "react-router-dom"
import { useLogout } from "../../hook/useAuth"

export default function Logout() {
    const performLogout = useLogout();

    performLogout()
    
    return <Navigate to="/"/>
}