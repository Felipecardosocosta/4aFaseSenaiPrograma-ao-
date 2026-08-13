import bcrypt from "bcrypt";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { signTokenAcesso } from "../utils/jwt.js";
import { createHash } from "../utils/createHash.js";

export class UsuarioServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = "UsuarioServiceError";
        this.code = code;
    }
}

class UsuarioServices {
    async login({ email, senha }) {
        const resultado = await usuarioRepository.buscarUsuarioPorEmail(String(email).trim().toLowerCase());
        const usuario = resultado.rows[0];

        if (!usuario || !(await bcrypt.compare(String(senha), usuario.senha || ""))) {
            throw new UsuarioServiceError("E-mail ou senha inválidos", "CREDENCIAIS_INVALIDAS");
        }
        if (usuario.status_user !== "ATIVO") {
            throw new UsuarioServiceError("Usuário aguardando ativação ou desativado", "USUARIO_INATIVO");
        }

        return signTokenAcesso({ email: usuario.email, nome: usuario.nome, tipo: usuario.tipo });
    }

    async cadastro({ nome, email, cpf, senha }) {
        const nomeNormalizado = String(nome).trim();
        const emailNormalizado = String(email).trim().toLowerCase();
        const cpfNormalizado = String(cpf).replace(/\D/g, "");

        if (nomeNormalizado.length < 3) throw new UsuarioServiceError("Nome inválido", "DADOS_INVALIDOS");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) throw new UsuarioServiceError("E-mail inválido", "DADOS_INVALIDOS");
        if (!/^\d{11}$/.test(cpfNormalizado)) throw new UsuarioServiceError("CPF inválido", "DADOS_INVALIDOS");
        if (String(senha).length < 8) throw new UsuarioServiceError("A senha deve possuir pelo menos 8 caracteres", "DADOS_INVALIDOS");

        const [porEmail, porCpf] = await Promise.all([
            usuarioRepository.buscarUsuarioPorEmail(emailNormalizado),
            usuarioRepository.buscarUsuarioPorCpf(cpfNormalizado)
        ]);
        if (porEmail.rows.length > 0 || porCpf.rows.length > 0) {
            throw new UsuarioServiceError("CPF ou e-mail já cadastrado", "USUARIO_DUPLICADO");
        }

        try {
            return await usuarioRepository.cadastrarUsuario({
                nome: nomeNormalizado,
                email: emailNormalizado,
                cpf: cpfNormalizado,
                senha: await createHash(senha)
            });
        } catch (error) {
            if (error.code === "23505") throw new UsuarioServiceError("CPF ou e-mail já cadastrado", "USUARIO_DUPLICADO");
            throw error;
        }
    }

    async mudarStatus({ id, status }) {
        const statusPermitidos = { pendente: "PENDENTE", ativar: "ATIVO", desativar: "DESATIVADO" };
        const usuario = await usuarioRepository.buscarUsuarioPorId(id);
        if (usuario.rows.length === 0 || !statusPermitidos[status]) {
            throw new UsuarioServiceError("Usuário ou status não encontrado", "DADOS_INVALIDOS");
        }
        return usuarioRepository.mudarPermissaoUsuario({ id, permissao: statusPermitidos[status] });
    }
}

export const usuarioServices = new UsuarioServices();
