import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../api"

function SolicitarAcesso(){
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const [mensagem, setMensagem] = useState("")

    const navigate = useNavigate()

    async function enviarSolicitacao(event){
        event.preventDefault()
        setMensagem("")

        if (senha !== confirmarSenha){
            setMensagem("As senhas precisam ser iguais.")
            return
        }

        try {
            const resposta = await fetch(`${API_URL}/solicitacoes`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    nome,
                    email,
                    senha
                })
            })

            const dados = await resposta.json()

            if (!resposta.ok){
                setMensagem(dados.mensagem)
                return
            }

            setNome("")
            setEmail("")
            setSenha("")
            setConfirmarSenha("")
            setMensagem("Solicitação enviada com sucesso. Aguarde um administrador aprovar seu acesso.")
        } catch {
            setMensagem("Não foi possível conectar à API.")
        }
    }

    return (
        <main>
            <h1>Solicitar acesso</h1>
            <form onSubmit={enviarSolicitacao}>
                <label htmlFor="nome">Nome</label>
                <input type="text" id="nome" value={nome} onChange={(event) => setNome(event.target.value)} required />
                <br />

                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" value={email} onChange={(event)=> setEmail(event.target.value)} required />
                <br />

                <label htmlFor="senha">Senha</label>
                <input type="password" id="senha" value={senha} onChange={(event)=> setSenha(event.target.value)} required />
                <br />

                <label htmlFor="confirmar-senha">Confirmar senha</label>
                <input type="password" id="confirmar-senha" value={confirmarSenha} onChange={(event)=> setConfirmarSenha(event.target.value)} required />
                <br />
                <button type="submit">Enviar solicitação</button>
            </form>
            
            {mensagem && (<p>{mensagem}</p>)}
            
            <button type="button" onClick={()=>navigate("/")}>Voltar para o login</button>
        </main>
    )
}

export default SolicitarAcesso