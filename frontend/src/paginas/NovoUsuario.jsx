import { useEffect, useState } from "react"
import {useNavigate} from "react-router-dom"
import {API_URL} from "../api"

function NovoUsuario() {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [perfil, setPerfil] =useState("Cliente")
    const [mensagem, setMensagem] = useState("")
    const [codigo, setCodigo] = useState("")
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    useEffect(()=> {
        if(!token) {
            navigate("/")
            return
        }

        try {
            const usuarioLogado = JSON.parse(atob(token.split(".")[1]))

            if (usuarioLogado.perfil !== "Administrador") {
                navigate("/meus-dados")
            }
        } catch {
            localStorage.removeItem("token")
            navigate("/")
        }
    }, [navigate, token])

    async function cadastrarUsuario(event) {
        event.preventDefault()
        setMensagem("")
        setCodigo("")

        try {
            const resposta = await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({nome, email, perfil})
            })

            const dados = await resposta.json()

            if (!resposta.ok){
                setMensagem(dados.mensagem)
                return
            }

            setMensagem("Usuário cadastrado com sucesso!")
            setCodigo(dados.codigoPrimeiroAcesso)

            setNome("")
            setEmail("")
            setPerfil("Cliente")
        } catch {
            setMensagem("Não foi possível cadastrar o usuário.")
        }
    }

    return (
        <main>
            <h1>Novo usuário</h1>

            <form onSubmit={cadastrarUsuario}>
                <label htmlFor="nome">Nome</label>
                <input type="text" id="nome" value={nome} onChange={(event)=> setNome(event.target.value)} required />

                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" value={email} onChange={(event)=> setEmail(event.target.value)} required />

                <label htmlFor="perfil">Perfil de acesso</label>
                <select id="perfil" value={perfil} onChange={(event)=> setPerfil(event.target.value)}>
                    <option value="Cliente">Cliente</option>
                    <option value="Operador">Operador</option>
                    <option value="Administrador">Administrador</option>
                </select>

                <button type="submit">Cadastrar usuário</button>
            </form>

            {mensagem && (<p>{mensagem}</p>)}
            {codigo && (
                <div>
                    <p><strong>Código de primeiro acesso:</strong></p>
                    <p>{codigo}</p>
                    <p>Informe este código ao usuário para que ele possa definir a própria senha.</p>
                </div>
            )}

            <button type="button" onClick={() => navigate("/usuarios")}>Voltar</button>
        </main>
    )
}

export default NovoUsuario