import { Navigate } from "react-router-dom"

function decodificarToken(token){
    if (!token) {
        return null
    }

    try {
        const partes = token.split(".")

        if (partes.length !== 3) {
            return null
        }

        return JSON.parse(atob(partes[1]))
    } catch {
        return null
    }
}

function RotaProtegida({children, perfis}){
    const token = localStorage.getItem("token")
    const usuario = decodificarToken(token)

    if (!usuario) {
        return <Navigate to="/" replace />
    }

    if (perfis && !perfis.includes(usuario.perfil)) {
        return <Navigate to="/meus-dados" replace />
    }

    return children
}

export default RotaProtegida