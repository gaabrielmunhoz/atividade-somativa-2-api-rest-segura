import { Navigate } from "react-router-dom"

function RotaProtegida({children, perfis}){
    const token = localStorage.getItem("token")

    if (!token) {
        return <Navigate to="/" replace />
    }

    try {
        const usuario = JSON.parse(atob(token.split(".")[1]))
        if (usuario.exp && usuario.exp * 1000 < Date.now()) {
            localStorage.removeItem("token")
            return <Navigate to="/" replace />
        }

        if (perfis && !perfis.includes(usuario.perfil)) {
            return <Navigate to="/meus-dados" replace />
        }
        return children
    } catch {
        localStorage.removeItem("token")
        return <Navigate to="/" replace />
    }
}

export default RotaProtegida