import { useLocation,Navigate } from "react-router-dom"



export const setToken = (loggedInEmail, token)=>{
    localStorage.setItem('email', loggedInEmail)
    localStorage.setItem('token', token)
}

export const fetchToken = (token)=>{
    return localStorage.getItem('token')
}

export function RequireToken({children}){

    let auth = fetchToken()
    let location = useLocation()

    if(!auth){

        return <Navigate to='/' state ={{from : location}}/>;
    }

    return children;
}