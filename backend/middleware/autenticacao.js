const jwt = require("jsonwebtoken")

function autenticarToken(req, res, next) {
    const authorization = req.headers.authorization

    if (!authorization) {
        return res.status(401).json({
            mensagem: "Token não informado."
        })
    }

    const partes = authorization.split(" ")

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({
            mensagem: "Token inválido."
        })
    }

    const token = partes[1]

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET)

        req.usuario = usuario

        next()
    } catch {
        return res.status(401).json({
            mensagem: "Token inválido ou expirado."
        })
    }
}

module.exports = autenticarToken