import {
    ProfissionalServiceError,
    profissionalServices
} from "../services/ProfissionalServices.js";

function possuiCampoVazio(campos) {
    return campos.some(
        (campo) => campo === undefined || campo === null || String(campo).trim() === ""
    );
}

function responderErro(error, res) {
    if (error instanceof ProfissionalServiceError) {
        const statusPorCodigo = {
            PROFISSIONAL_DUPLICADO: 409,
            REGISTRO_NAO_ENCONTRADO: 404,
            DADOS_INVALIDOS: 422
        };

        return res.status(statusPorCodigo[error.code] ?? 422).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro interno no servidor" });
}

class ProfissionalController {
    async cadastrar(req, res) {
        const { nome, email, cpf, senha, tipo } = req.body;

        if (possuiCampoVazio([nome, email, cpf, senha, tipo])) {
            return res.status(422).json({ message: "Preencha todos os campos obrigatórios" });
        }

        try {
            await profissionalServices.cadastro({ nome, email, cpf, senha, tipo });
            return res.status(201).json({ message: "Profissional cadastrado com sucesso" });
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async cadastrarDisponibilidade(req, res) {
        const { profissionalId } = req.params;
        const { data_disponivel, hora_inicio, hora_fim, disponivel } = req.body;

        if (possuiCampoVazio([profissionalId, data_disponivel, hora_inicio, hora_fim])) {
            return res.status(422).json({ message: "Preencha todos os campos obrigatórios" });
        }

        try {
            await profissionalServices.cadastrarDisponibilidade({
                profissionalId,
                dataDisponivel: data_disponivel,
                horaInicio: hora_inicio,
                horaFim: hora_fim,
                disponivel
            });

            return res.status(201).json({ message: "Disponibilidade cadastrada com sucesso" });
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async alterarDisponibilidade(req, res) {
        const { id } = req.params;
        const { data_disponivel, hora_inicio, hora_fim, disponivel } = req.body;

        if (possuiCampoVazio([id, data_disponivel, hora_inicio, hora_fim, disponivel])) {
            return res.status(422).json({ message: "Preencha todos os campos obrigatórios" });
        }

        try {
            await profissionalServices.alterarDisponibilidade({
                id,
                dataDisponivel: data_disponivel,
                horaInicio: hora_inicio,
                horaFim: hora_fim,
                disponivel
            });

            return res.status(200).json({ message: "Disponibilidade alterada com sucesso" });
        } catch (error) {
            return responderErro(error, res);
        }
    }
}

export const profissionalController = new ProfissionalController();
