import { useLocation, useNavigate } from "react-router-dom"

function Navbar(){
    const navigate = useNavigate()
    const location = useLocation()
    const token = localStorage.getItem("token")

    if (!token || location.pathname === "/" || location.pathname === "/solicitar-acesso" || location.pathname === "/primeiro-acesso"){
        return null
    }

    let usuarioLogado

    try {
        usuarioLogado = JSON.parse(atob(token.split(".")[1]))
    } catch {
        return null
    }

    function sair(){
        localStorage.removeItem("token")
        navigate("/")
    }

    return (
        <nav className="navbar">
            <strong>Gestão de Usuários</strong>
            <div>
                <button type="button" onClick={()=>navigate("/meus-dados")}>Meus dados</button>

                {usuarioLogado.perfil !== "Cliente" && (
                    <button type="button" onClick={()=> navigate("/usuarios")}>Usuários</button>
                )}

                {usuarioLogado.perfil === "Administrador" && (
                    <button type="button" onClick={()=> navigate("/solicitacoes")}>Solicitações</button>
                )}

                <button type="button" onClick={sair}>Sair</button>
            </div>
        </nav>
    )
}

export default Navbar