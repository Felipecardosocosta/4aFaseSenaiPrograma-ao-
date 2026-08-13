import { UsuarioServiceError, usuarioServices } from "../services/UsuarioServices.js";

function responderErro(error, res) {
    if (error instanceof UsuarioServiceError) {
        const status = error.code === "USUARIO_DUPLICADO" ? 409 :
            error.code === "CREDENCIAIS_INVALIDAS" ? 401 :
                error.code === "USUARIO_INATIVO" ? 403 : 422;
        return res.status(status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno no servidor" });
}

class UsuarioController {
    async login(req, res) {
        const { email, senha } = req.body;
        if (!email || !senha) return res.status(422).json({ message: "Preencha e-mail e senha" });

        try {
            const token = await usuarioServices.login({ email, senha });
            return res.status(200).json({ message: "Usuário logado com sucesso", token });
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async cadastrar(req, res) {
        const { email, senha, cpf, nome } = req.body;
        if (!email || !senha || !cpf || !nome) {
            return res.status(422).json({ message: "Preencha todos os campos obrigatórios" });
        }

        try {
            const resultado = await usuarioServices.cadastro({ email, senha, cpf, nome });
            return res.status(201).json({
                message: "Usuário cadastrado. Aguarde a ativação da conta.",
                usuario: resultado.rows[0]
            });
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async mudarStatus(req, res) {
        const { id, novoStatus } = req.body;
        try {
            const resultado = await usuarioServices.mudarStatus({ id, status: novoStatus });
            return res.status(200).json({ message: "Status alterado com sucesso", usuario: resultado.rows[0] });
        } catch (error) {
            return responderErro(error, res);
        }
    }
}

export const usuarioController = new UsuarioController();
