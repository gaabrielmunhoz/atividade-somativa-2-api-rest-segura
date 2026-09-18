function autorizarPerfis(...perfisPermitidos) {
    return (req, res, next) => {
        if (!perfisPermitidos.includes(req.usuario.perfil)){
            return res.status(403).json({
                mensagem: "Acesso não autorizado."
            })
        }
        next()
    }
}

module.exports = autorizarPerfis