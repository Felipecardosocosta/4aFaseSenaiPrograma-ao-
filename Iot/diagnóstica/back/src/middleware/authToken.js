import { verificarTokenAcesso } from "../utils/jwt.js";

export function authToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token inválido" });
    }

    try {
        const token = header.slice("Bearer ".length);
        req.usuario = verificarTokenAcesso(token);
        return next();
    } catch {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}
