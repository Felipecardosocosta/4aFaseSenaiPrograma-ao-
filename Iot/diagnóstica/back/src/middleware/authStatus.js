import { verificarTokenAcesso } from "../utils/jwt.js";

export function authStatus(tiposPermitidos) {
    const tipos = Array.isArray(tiposPermitidos) ? tiposPermitidos : [tiposPermitidos];

    return (req, res, next) => {
        const header = req.headers.authorization;

        if (!header?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Token inválido" });
        }

        try {
            const token = header.slice("Bearer ".length);
            const usuarioToken = verificarTokenAcesso(token);

            if (!tipos.includes(usuarioToken.tipo)) {
                return res.status(403).json({ error: "Acesso negado" });
            }

            req.usuario = usuarioToken;
            return next();
        } catch {
            return res.status(401).json({ error: "Token inválido ou expirado" });
        }
    };
}
