const express = require("express")
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const autenticarToken = require("./middleware/autenticacao")
const autorizarPerfis = require("./middleware/autorizacao")
const cors = require("cors")
const crypto = require("crypto")

require("dotenv").config({
    path: path.join(__dirname, ".env")
})

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

const caminhoUsuarios = path.join(__dirname, "data", "usuarios.json")
const caminhoSolicitacoes = path.join(
    __dirname,
    "data",
    "solicitacoes.json"
)

app.post("/login", async (req, res) => {
    const {email, senha} = req.body

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: "E-mail e senha são obrigatórios."
        })
    }

    const dados = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dados)

    const usuario = usuarios.find(usuario => usuario.email === email)

    if (!usuario) {
        return res.status(401).json({
            mensagem: "E-mail ou senha inválidos."
        })
    }

    if (usuario.primeiroAcesso === true || !usuario.senha){
        return res.status(403).json({
            mensagem: "Primeiro acesso pendente. Defina a sua senha antes de entrar."
        })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
        return res.status(401).json({
            mensagem: "E-mail ou senha inválidos."
        })
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            nome: usuario.nome,
            perfil: usuario.perfil
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    )

    res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        token
    })
})

app.post("/primeiro-acesso", async (req, res=> {
    const {email, codigo, senha} = req.body

    if (!email || !codigo || !senha){
        return res.status(400).json({
            mensagem: "E-mail, código e senha são obrigatórios."
        })
    }

    const dados = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dados)
    const usuario = usuarios.find(usuario=> usuario.email === email)

    if (!usuario) {
        return res.status(404).json({
            mensagem: "Usuário não encontrado."
        })
    }

    if (!usuario.primeiroAcesso || !usuario.codigoPrimeirioAcesso){
        return res.status(409).json({
            mensagem: "O primeiro acesso deste usuário já foi concluído."
        })
    }

    const codigoValido = await bcrypt.compare(
        codigo,
        usuario.codigoPrimeirioAcesso
    )

    if (!codigoValido){
        return res.status(401).json({
            mensagem: "Código inválido."
        })
    }

    usuario.senha = await bcrypt.hash(senha,10)
    usuario.primeiroAcesso = false
    delete usuario.codigoPrimeirioAcesso
    fs.writeFileSync(
        caminhoUsuarios,
        JSON.stringify(usuarios, null, 2)
    )

    res.status(200).json({
        mensagem: "Nova senha definida com sucesso. Agora já pode fazer o login."
    })

}))

app.post("/solicitacoes", async (req,res) => {
    const {nome,email,senha} = req.body

    if (!nome || !email || !senha) {
        return res.status(400).json({
            mensagem: "Nome, e-mail e senha são obrigatórios."
        })
    }

    const dadosUsuarios = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dadosUsuarios)

    const dadosSolicitacoes = fs.readFileSync(caminhoSolicitacoes, "utf-8")
    const solicitacoes = JSON.parse(dadosSolicitacoes)
    const emailJaCadastrado = usuarios.some(
        usuario => usuario.email === email
    )

    if (emailJaCadastrado) {
        return res.status(409).json({
            mensagem: "Já existe um usuário cadastrado com este e-mail."
        })
    }

    const solicitacaoJaExiste = solicitacoes.some(
        solicitacao => solicitacao.email === email
    )

    if (solicitacaoJaExiste) {
        return res.status(409).json({
            mensagem: "Já existe uma solicitação pendente para este e-mail."
        })
    }

    const senhaHash = await bcrypt.hash(senha,10)
    const novoId = solicitacoes.length>0
    ? Math.max(...solicitacoes.map(solicitacao => solicitacao.id)) + 1
    : 1

    const novaSolicitacao = {
        id: novoId,
        nome,
        email,
        senha: senhaHash,
        status: "Pendente"
    }

    solicitacoes.push(novaSolicitacao)

    fs.writeFileSync(
        caminhoSolicitacoes,
        JSON.stringify(solicitacoes, null, 2)
    )

    res.status(201).json({
        id: novaSolicitacao.id,
        nome: novaSolicitacao.nome,
        email: novaSolicitacao.email,
        status: novaSolicitacao.status
    })
})

app.get("/solicitacoes", autenticarToken, autorizarPerfis("Administrador"), (req, res) => {
    const dados = fs.readFileSync(caminhoSolicitacoes, "utf-8")
    const solicitacoes = JSON.parse(dados)

    const solicitacoesSemSenha = solicitacoes.map(solicitacao => ({
        id: solicitacao.id,
        nome: solicitacao.nome,
        email: solicitacao.email,
        status: solicitacao.status
    }))

    res.status(200).json(solicitacoesSemSenha)
})

app.post("/solicitacoes/:id/aprovar", autenticarToken, autorizarPerfis("Administrador"), (req,res)=> {
    const id = Number(req.params.id)
    const {perfil} = req.body
    const perfisPermitidos = [
        "Administrador",
        "Operador",
        "Cliente"
    ]

    if (!perfil || !perfisPermitidos.includes(perfil)) {
        return res.status(400).json({
            mensagem: "Perfil de acesso inválido."
        })
    }

    const dadosSolicitacoes = fs.readFileSync(caminhoSolicitacoes, "utf-8")
    const solicitacoes = JSON.parse(dadosSolicitacoes)

    const indiceSolicitacao = solicitacoes.findIndex(
        solicitacao => solicitacao.id === id
    )

    if (indiceSolicitacao === -1){
        return res.status(404).json({
            mensagem: "Solicitação não encontrada."
        })
    }

    const solicitacao = solicitacoes[indiceSolicitacao]
    const dadosUsuarios = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dadosUsuarios)
    const emailJaExiste = usuarios.some(
        usuario => usuario.email === solicitacao.email
    )

    if (emailJaExiste){
        return res.status(409).json({
            mensagem: "Já existe um usuário cadastrado com este e-mail."
        })
    }

    const novoId = usuarios.length > 0
    ? Math.max(...usuarios.map(usuario => usuario.id)) + 1
    :1

    const novoUsuario = {
        id: novoId,
        nome: solicitacao.nome,
        email: solicitacao.email,
        senha: solicitacao.senha,
        perfil
    }

    usuarios.push(novoUsuario)

    fs.writeFileSync(caminhoUsuarios, JSON.stringify(usuarios,null,2))

    solicitacoes.splice(indiceSolicitacao, 1)
    
    fs.writeFileSync(caminhoSolicitacoes, JSON.stringify(solicitacoes,null,2))

    res.status(201).json({
        mensagem: "Solicitação aprovada com sucesso.",
        usuario: {
            id: novoUsuario.id,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            perfil: novoUsuario.perfil
        }
    })
})

app.delete("/solicitacoes/:id", autenticarToken, autorizarPerfis("Administrador"), (req, res) => {
    const id = Number(req.params.id)

    const dados = fs.readFileSync(caminhoSolicitacoes, "utf-8")

    const solicitacoes = JSON.parse(dados)

    const indiceSolicitacao = solicitacoes.findIndex(solicitacao => solicitacao.id === id)

    if (indiceSolicitacao ===-1) {
        return res.status(404).json({
            mensagem: "Solicitação não encontrada."
        })
    }

    solicitacoes.splice(indiceSolicitacao, 1)

    fs.writeFileSync(caminhoSolicitacoes, JSON.stringify(solicitacoes, null, 2))

    res.status(204).send()
})

app.get("/usuarios",autenticarToken, autorizarPerfis("Administrador", "Operador"), (req, res) => {
    const dados = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dados)

    const usuariosSemSenha = usuarios.map(usuario => ({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
    }))

    res.status(200).json(usuariosSemSenha)
})

app.get("/usuarios/:id",autenticarToken, (req, res) => {
    const id = Number(req.params.id)
    const dados = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dados)

    const usuario = usuarios.find(usuario => usuario.id === id)

    if (!usuario) {
        return res.status(404).json({
            mensagem: "Usuário não encontrado."
        })
    }

    const podeConsultar = 
    req.usuario.perfil === "Administrador" ||
    req.usuario.perfil === "Operador" ||
    (req.usuario.perfil === "Cliente" && req.usuario.id === id)

    if (!podeConsultar) {
        return res.status(403).json({
            mensagem: "Acesso não autorizado."
        })
    }

    res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
    })
})

app.put("/usuarios/:id",autenticarToken,autorizarPerfis("Administrador", "Operador"), (req, res) => {
    const id = Number(req.params.id)
    const {nome, email, perfil} = req.body

    const dados = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dados)

    const usuario = usuarios.find(usuario => usuario.id === id)

    if (!usuario) {
        return res.status(404).json({
            mensagem: "Usuário não encontrado."
        })
    }

    if (req.usuario.perfil === "Operador") {
        const editandoProprioUsuario = req.usuario.id ===id
        const editandoCliente = usuario.perfil === "Cliente"

        if (!editandoProprioUsuario && !editandoCliente) {
            return res.status(403).json({
                mensagem: "Operadores só podem editar cliente ou os seus próprios dados."
            })
        }

        if (perfil) {
            return res.status(403).json({
                mensagem: "Operadores não podem alterar o perfil de acesso."
            })
        }
    }

    if (email) {
        const emailJaExiste = usuarios.some(
            outroUsuario => outroUsuario.email === email && outroUsuario.id !== id
        )
        if (emailJaExiste) {
            return res.status(409).json({
                mensagem: "Já existe um usuário cadastrado com este e-mail."
            })
        }
    }

    const perfisPermitidos = ["Administrador", "Operador", "Cliente"]

    if (perfil && !perfisPermitidos.includes(perfil)){
        return res.status(400).json({
            mensagem: "Perfil de acesso inválido."
        })
    }

    if (nome) usuario.nome = nome
    if (email) usuario.email = email
    if (perfil) usuario.perfil = perfil

    fs.writeFileSync(
        caminhoUsuarios,
        JSON.stringify(usuarios, null, 2)
    )

    res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
    })
})

app.delete("/usuarios/:id", autenticarToken, autorizarPerfis("Administrador"), (req, res) => {
    const id = Number(req.params.id)

    const dados = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dados)

    const indiceUsuario = usuarios.findIndex(usuario => usuario.id === id)

    if (indiceUsuario === -1) {
        return res.status(404).json({
            mensagem: "Usuário não encontrado."
        })
    }

    usuarios.splice(indiceUsuario, 1)

    fs.writeFileSync(caminhoUsuarios, JSON.stringify(usuarios, null, 2))
    res.status(204).send()
})

app.post("/usuarios", autenticarToken, autorizarPerfis("Administrador"), async (req, res) => {
    const {nome, email, senha, perfil} = req.body

    if (!nome || !email || !perfil) {
        return res.status(400).json({
            mensagem: "Todos os campos são obrigatórios."
        })
    }

    const perfisPermitidos = ["Administrador", "Operador", "Cliente"]

    if (!perfisPermitidos.includes(perfil)) {
        return res.status(400).json({
            mensagem: "Perfil de acesso inválido."
        })
    }

    const dados = fs.readFileSync(caminhoUsuarios, "utf-8")
    const usuarios = JSON.parse(dados)

    const emailJaExiste = usuarios.some(
        usuario => usuario.email === email
    )

    if (emailJaExiste) {
        return res.status(409).json({
            mensagem: "Já existe um usuário cadastrado com este e-mail."
        })
    }

    const novoId = usuarios.length > 0
    ? Math.max(...usuarios.map(usuario => usuario.id)) + 1
    : 1

    const codigoPrimeirioAcesso = crypto.randomBytes(4).toString("hex").toUpperCase()

    const codigoHash = await bcrypt.hash(codigoPrimeirioAcesso,10)

    const novoUsuario = {
        id: novoId,
        nome,
        email,
        senha: null,
        perfil,
        primeiroAcesso: true,
        codigoPrimeirioAcesso: codigoHash
    }

    usuarios.push(novoUsuario)

    fs.writeFileSync(
        caminhoUsuarios,
        JSON.stringify(usuarios, null, 2)
    )

    res.status(201).json({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil,
        primeiroAcesso: true,
        codigoPrimeirioAcesso
    })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
});