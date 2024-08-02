import { useNavigate } from "react-router-dom"
import { useLogout } from "../../hook/useAuth"
import { useEffect } from "react";

export default function Logout() {
    const navigate = useNavigate();
    const performLogout = useLogout();
    useEffect(()=>{
        performLogout()
        navigate('/')
    },[])
    return (<></>)
}