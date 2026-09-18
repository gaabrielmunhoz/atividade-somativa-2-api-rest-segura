import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../api"
import { useEffect } from "react"

function MeusDados(){
    const [usuario, setUsuario] = useState(null)
    const [mensagem, setMensagem] = useState("")

    const navigate = useNavigate()

    useEffect(()=> {
        async function buscarMeusDados(){
            const token = localStorage.getItem("token")

            if(!token) {
                navigate("/")
                return
            }

            try {
                const dadosToken = JSON.parse(atob(token.split(".")[1]))
                const resposta = await fetch(`${API_URL}/usuarios/${dadosToken.id}`,
                    {headers: {Authorization: `Bearer ${token}`}}
                )
                const dados = await resposta.json()

                if (!resposta.ok) {
                    setMensagem(dados.mensagem)
                    if (resposta.status === 401) {
                        localStorage.removeItem("token")
                        navigate("/")
                    }
                    return
                }
                setUsuario(dados)
            } catch {
                setMensagem("Não foi possível carregar os dados do usuário.")
            }
        }
        buscarMeusDados()
    }, [navigate])

    if (!usuario) {
        return (
            <main>
                <h1>Meus dados</h1>
                {mensagem ? (<p>{mensagem}</p>) : (<p>Carregando...</p>)}
            </main>
        )
    }

    return (
        <main>
            <h1>Meus dados</h1>
            <p><strong>Nome:</strong> {usuario.nome}</p>
            <p><strong>E-mail:</strong> {usuario.email}</p>
            <p><strong>Perfil:</strong> {usuario.perfil}</p>

            {usuario.perfil !== "Cliente" && (
                <button type="button" onClick={()=> navigate(`/usuarios/${usuario.id}/editar`)}>Editar meus dados</button>
            )}

            {usuario.perfil !== "Cliente" && (
                <button type="button" onClick={()=> navigate("/usuarios")}>Ver usuários</button>
            )}

            {usuario.perfil === "Administrador" && (
                <button type="button" onClick={()=> navigate("/solicitacoes")}>Ver solicitações</button>
            )}

        </main>
    )
}

export default MeusDados