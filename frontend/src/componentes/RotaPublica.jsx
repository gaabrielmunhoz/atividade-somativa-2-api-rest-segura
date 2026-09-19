import { Navigate } from "react-router-dom"

function RotaPublica({children}){
    const token = localStorage.getItem("token")

    if(!token) {
        return children
    }

    try {
        const usuario = JSON.parse(atob(token.split(".")[1]))

        if (usuario.exp && usuario.exp * 1000 < Date.now()){
            localStorage.removeItem("token")
            return children
        }

        return <Navigate to="/meus-dados" repplace />
    } catch {
        localStorage.removeItem("token")
        return children
    }
}

export default RotaPublica