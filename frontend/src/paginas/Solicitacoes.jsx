import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../api"

function Solicitacoes(){
    const [solicitacoes, setSolicitacoes] = useState([])
    const [perfis, setPerfis] = useState({})
    const [mensagem, setMensagem] = useState("")
    const [pesquisa, setPesquisa] = useState("")

    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    useEffect(()=> {
        async function buscarSolicitacoes(){
            if (!token) {
                navigate("/")
                return
            }

            try {
                const usuarioLogado = JSON.parse(atob(token.split(".")[1]))

                if (usuarioLogado.perfil !== "Administrador") {
                    navigate("/meus-dados")
                    return
                }

                const resposta = await fetch(`${API_URL}/solicitacoes`,
                    {headers: {
                        Authorization: `Bearer ${token}`
                    }}
                )
                const dados = await resposta.json()

                if(!resposta.ok){
                    setMensagem(dados.mensagem)
                    if (resposta.status === 401) {
                        localStorage.removeItem("token")
                        navigate("/")
                    }
                    return
                }

                setSolicitacoes(dados)

                const perfisIniciais = {}
                dados.forEach(solicitacao => {perfisIniciais[solicitacao.id] = "Cliente"})
                setPerfis(perfisIniciais)
            } catch {
                setMensagem("Não foi possível carregar as solicitações.")
            }
        }
        buscarSolicitacoes()
    }, [navigate, token])

    async function aprovarSolicitacao(id){
        setMensagem("")
        try{
            const resposta = await fetch(`${API_URL}/solicitacoes/${id}/aprovar`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({perfil: perfis[id]})
            })

            const dados = await resposta.json()

            if(!resposta.ok){
                setMensagem(dados.mensagem)
                return
            }
            setSolicitacoes(solicitacoes.filter(solicitacao=>solicitacao.id !== id))
            setMensagem("Solicitação aprovada com sucesso.")
        } catch {
            setMensagem("Não foi possível aprovar a solicitação.")
        }
    }

    async function recusarSolicitacao(id){
        const confirmar = window.confirm("Deseja realmente recusar esta solicitação?")

        if (!confirmar){
            return
        }
        setMensagem("")

        try{
            const resposta = await fetch(`${API_URL}/solicitacoes/${id}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`}
            })

            if (!resposta.ok) {
                const dados = await resposta.json()
                setMensagem(dados.mensagem)
                return
            }
            setSolicitacoes(solicitacoes.filter(solicitacao=>solicitacao.id !== id))
            setMensagem("Solicitação recusada com sucesso.")
        } catch {
            setMensagem("Não foi possível rejeitar a solicitação.")
        }
    }

    const solicitacoesFiltradas = solicitacoes.filter(solicitacao=> {
        const termo = pesquisa.toLowerCase()

        return (
            solicitacao.nome.toLowerCase().includes(termo) ||
            solicitacao.email.toLowerCase().includes(termo)
        )
    })

    return(
        <main>
            <h1>Solicitações de acesso</h1>
            <button type="button" onClick={()=> navigate("/meus-dados")}>Voltar</button>
            <br />
            <br />
            <label htmlFor="pesquisa">Pesquisar solicitação</label>
            <input type="text" id="pesquisa" placeholder="Nome ou e-mail" value={pesquisa} onChange={(event)=> setPesquisa(event.target.value)} />

            {mensagem && (<p>{mensagem}</p>)}
            <hr />
            {solicitacoesFiltradas.length === 0 ? (
                <p>Nenhuma solicitação pendente.</p>
            ) : (
                solicitacoesFiltradas.map(solicitacao=>(
                    <div key={solicitacao.id}>
                        <p><strong>Nome:</strong>{" "}{solicitacao.nome}</p>
                        <p><strong>E-mail:</strong>{" "}{solicitacao.email}</p>
                        <p><strong>Status:</strong>{" "}{solicitacao.status}</p>

                        <label htmlFor={`perfil-${solicitacao.id}`}>Perfil:</label>
                        <select id={`perfil-${solicitacao.id}`} value={perfis[solicitacao.id]||"Cliente"} onChange={(event)=> setPerfis({...perfis, [solicitacao.id]:event.target.value})}>
                            <option value="Cliente">Cliente</option>
                            <option value="Operador">Operador</option>
                            <option value="Administrador">Administrador</option>
                        </select>

                        <button type="button" onClick={()=> aprovarSolicitacao(solicitacao.id)}>Aprovar</button>
                        <button type="button" onClick={()=>recusarSolicitacao(solicitacao.id)}>Recusar</button>
                        <hr />
                    </div>
                ))
            )}
        </main>
    )
}
export default Solicitacoes