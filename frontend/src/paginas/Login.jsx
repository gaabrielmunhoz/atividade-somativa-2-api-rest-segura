import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../api"

function Login(){
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [mensagem, setMensagem] = useState("")
    const navigate = useNavigate()

    async function entrar(event){
        event.preventDefault()
        setMensagem("")

        try {
            const resposta = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email,
                    senha
                })
            })

            const dados = await resposta.json()
            if (!resposta.ok){
                setMensagem(dados.mensagem)
                return
            }

            localStorage.setItem("token", dados.token)
            navigate("/meus-dados")
        } catch {
            setMensagem("Não foi possível conectar à API.")
        }
    }

    return (
        <main>
            <h1>Login</h1>
            <form onSubmit={entrar}>
                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" value={email} onChange={(event)=>setEmail(event.target.value)} required />
                <br></br>

                <label htmlFor="senha">Senha</label>
                <input type="password" id="senha" value={senha} onChange={(event)=> setSenha(event.target.value)} required />
                <br></br>

                <button type="submit">Entrar</button>
            </form>

            {mensagem && (<p>{mensagem}</p>)}

            <button type="button" onClick={()=>navigate("/solicitar-acesso")}>Solicitar acesso</button>
        </main>
    )
}
export default Login