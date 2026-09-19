import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../api"

function PrimeiroAcesso(){
    const [email, setEmail] = useState("")
    const [codigo, setCodigo] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [mensagem, setMensagem] = useState("")
    const navigate = useNavigate()

    async function definirSenha(event) {
        event.preventDefault()
        setMensagem("")

        if (senha !== confirmarSenha){
            setMensagem("As senhas precisam ser iguais.")
            return
        }

        try {
            const resposta = await fetch(`${API_URL}/primeiro-acesso`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, codigo, senha})
            })

            const dados = await resposta.json()

            if (!resposta.ok) {
                setMensagem(dados.mensagem)
                return
            }

            setMensagem(dados.mensagem)
            setEmail("")
            setCodigo("")
            setSenha("")
            setConfirmarSenha("")
        } catch {
            setMensagem("Não foi possível conectar à API.")
        }
    }

    return (
        <main>
            <h1>Primeiro acesso</h1>
            <form onSubmit={definirSenha}>
                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" value={email} onChange={(event)=> setEmail(event.target.value)} required />

                <label htmlFor="codigo">Código de primeiro acesso</label>
                <input type="text" id="codigo" value={codigo} onChange={(event) => setCodigo(event.target.value)} required />

                <label htmlFor="senha">Nova senha</label>
                <input type="password" id="senha" value={senha} onChange={(event)=> setSenha(event.target.value)} required />

                <label htmlFor="confirmarSenha">Confirmar senha</label>
                <input type="password" id="confirmarSenha" value={confirmarSenha} onChange={(event)=> setConfirmarSenha(event.target.value)} required />

                <button type="submit">Definir senha</button>
            </form>

            {mensagem && (<p>{mensagem}</p>)}
            <button type="button" onClick={() => navigate("/")}>Voltar para o login</button>
        </main>
    )
}

export default PrimeiroAcesso