import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../api"


function Usuarios(){
    const [usuarios, setUsuarios] = useState([])
    const [mensagem, setMensagem] = useState("")
    const [pesquisa, setPesquisa] = useState("")

    const navigate = useNavigate()

    const token = localStorage.getItem("token")
    let usuarioLogado = null

    if (token) {
        usuarioLogado = JSON.parse(atob(token.split(".")[1]))
    }

    useEffect(()=> {
        async function buscarUsuarios(){
            if(!token) {
                navigate("/")
                return
            }

            try {
                const resposta = await fetch(`${API_URL}/usuarios`, {
                    headers: {Authorization: `Bearer ${token}`}
                })

                const dados = await resposta.json()

                if (!resposta.ok) {
                    setMensagem(dados.mensagem)
                    if (resposta.status === 401) {
                        localStorage.removeItem("token")
                        navigate("/")
                    }
                    return
                }

                setUsuarios(dados)
            } catch {
                setMensagem("Não foi possível carregar os usuários.")
            }
        }
        buscarUsuarios()
    }, [navigate, token])

    async function excluirUsuario(id) {
        const confirmar = window.confirm(
            "Deseja realmente excluir este usuário?"
        )
        if (!confirmar) {
            return
        }

        try {
            const resposta = await fetch(`${API_URL}/usuarios/${id}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`}
            }
            )
            if (!resposta.ok){
                const dados = await resposta.json()
                setMensagem(dados.mensagem)
                return
            }

            setUsuarios(usuarios.filter(usuario=>usuario.id !== id))

            setMensagem("Usuário excluído com sucesso.")
        } catch {
            setMensagem("Não foi possível excluir o usuário.")
        }
    }

    function podeEditar(usuario) {
        if (usuarioLogado.perfil === "Administrador"){
            return true
        }

        if (usuarioLogado.perfil === "Operador") {
            return (
                usuario.id === usuarioLogado.id || usuario.perfil === "Cliente"
            )
        }

        return false
    }

    const usuariosFiltrados = usuarios.filter(usuario => {
        const termo = pesquisa.toLowerCase()
        return(
            usuario.nome.toLowerCase().includes(termo) ||
            usuario.email.toLowerCase().includes(termo) ||
            usuario.perfil.toLowerCase().includes(termo)
        )
    })

    return (
        <main>
            <h1>Usuários</h1>
            <button type="button" onClick={()=> navigate("/meus-dados")}>Voltar</button>
            {mensagem && (<p>{mensagem}</p>)}
            <br />
            <br />

            <label htmlFor="pesquisa">Pesquisar usuário</label>
            <input type="text" id="pesquisa" placeholder="Nome, e-mail ou perfil" value={pesquisa} onChange={(event)=> setPesquisa(event.target.value)} />

            <hr />
            {usuariosFiltrados.length === 0? (
                <p>Nenhum usuário encontrado.</p>
            ) : (
                usuariosFiltrados.map(usuario => (
                    <div key={usuario.id}>
                        <p><strong>Nome:</strong> {usuario.nome}</p>
                        <p><strong>E-mail:</strong> {usuario.email}</p>
                        <p><strong>Perfil:</strong> {usuario.perfil}</p>

                        {usuario.id === usuarioLogado.id ? (
                            <button type="button" onClick={()=> navigate("/meus-dados")}>Meus dados</button>
                        ) : (
                            podeEditar(usuario) && (
                                <button type="button" onClick={()=>navigate(`/usuarios/${usuario.id}/editar`)}>Editar</button>
                            )
                        )}

                        {usuarioLogado.perfil === "Administrador" && usuario.id !== usuarioLogado.id && (
                            <button type="button" onClick={()=> excluirUsuario(usuario.id)}>Excluir</button>
                        )}
                        <hr />
                    </div>
                ))
            )}
        </main>
    )
}

export default Usuarios