import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { API_URL } from "../api"

function EditarUsuario() {
    const [nome, setNome] = useState("")
    const [email, setEmail]  = useState("")
    const [perfil, setPerfil] = useState("")
    const [mensagem, setMensagem] = useState("")

    const navigate = useNavigate()
    const {id} = useParams()

    const token = localStorage.getItem("token")
    let usuarioLogado = null

    if (token) {
        usuarioLogado = JSON.parse(atob(token.split(".")[1]))
    }

    useEffect(()=> {
        async function buscarUsuario(){
            if(!token){
                navigate("/")
                return
            }

            try {
                const resposta = await fetch(
                    `${API_URL}/usuarios/${id}`,
                    {headers: {
                        Authorization: `Bearer ${token}`
                    }}
                )

                const dados = await resposta.json()
                if (!resposta.ok){
                    setMensagem(dados.mensagem)
                    return
                }

                const podeEditar = usuarioLogado?.perfil === "Administrador" || (
                    usuarioLogado?.perfil === "Operador" && (
                        usuarioLogado.id === dados.id || dados.perfil == "Cliente"
                    )
                )

                if (!podeEditar) {
                    navigate("/usuarios")
                    return
                }

                setNome(dados.nome)
                setEmail(dados.email)
                setPerfil(dados.perfil)
            } catch {
                setMensagem("Não foi possível carregar o usuário.")
            }
        }

        buscarUsuario()
    }, [id, navigate, token, usuarioLogado?.id, usuarioLogado?.perfil])

    async function salvar(event){
        event.preventDefault()
        setMensagem("")
        const dadosAtualizados = {
            nome,
            email
        }

        if (usuarioLogado.perfil === "Administrador") {
            dadosAtualizados.perfil = perfil
        }

        try {
            const resposta = await fetch(`${API_URL}/usuarios/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dadosAtualizados)
            })
            const dados = await resposta.json()

            if (!resposta.ok) {
                setMensagem(dados.mensagem)
                return
            }
            setMensagem("Usuário atualizado com sucesso!")
        } catch {
            setMensagem("Não foi possível atualizar o usuário.")
        }
    }

    return(
        <main>
            <h1>Editar usuário</h1>
            <form onSubmit={salvar}>
                <label htmlFor="nome">Nome</label>
                <input type="text" id="nome" value={nome} onChange={(event)=> setNome(event.target.value)} required />
                <br />

                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" value={email} onChange={(event)=> setEmail(event.target.value)} required />
                <br />

                {usuarioLogado?.perfil === "Administrador" && (
                    <div>
                        <label htmlFor="perfil">Perfil</label>
                        <select id="perfil" value={perfil} onChange={(event)=> setPerfil(event.target.value)}>
                            <option value="Cliente">Cliente</option>
                            <option value="Operador">Operador</option>
                            <option value="Administrador">Administrador</option>
                        </select>
                        <br />
                    </div>
                )}
                <button type="submit">Salvar</button>
            </form>
            {mensagem &&(<p>{mensagem}</p>)}

            <button type="button" onClick={()=>navigate("/usuarios")}>Voltar</button>
        </main>
    )
}

export default EditarUsuario