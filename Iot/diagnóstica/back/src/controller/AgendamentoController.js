import {
    AgendamentoServiceError,
    agendamentoServices
} from "../services/AgendamentoServices.js";

function possuiCampoVazio(campos) {
    return campos.some(
        (campo) => campo === undefined || campo === null || String(campo).trim() === ""
    );
}

function extrairDados(body) {
    return {
        clienteId: body.cliente_id,
        profissionalId: body.profissional_id,
        dataAgendamento: body.data_agendamento,
        horaInicio: body.hora_inicio,
        horaFim: body.hora_fim,
        ambiente: body.ambiente,
        tipoFaxina: body.tipo_faxina,
        status: body.status,
        observacoes: body.observacoes ?? null
    };
}

function responderErro(error, res) {
    if (error instanceof AgendamentoServiceError) {
        const statusPorCodigo = {
            REGISTRO_NAO_ENCONTRADO: 404,
            HORARIO_CONFLITANTE: 409,
            PROFISSIONAL_INDISPONIVEL: 409,
            DADOS_INVALIDOS: 422
        };

        return res.status(statusPorCodigo[error.code] ?? 422).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro interno no servidor" });
}

class AgendamentoController {
    async verificarDisponibilidade(req, res) {
        const dados = extrairDados(req.body);
        const obrigatorios = [
            dados.clienteId,
            dados.profissionalId,
            dados.dataAgendamento,
            dados.horaInicio,
            dados.horaFim,
            dados.ambiente,
            dados.tipoFaxina
        ];

        if (possuiCampoVazio(obrigatorios)) {
            return res.status(422).json({ message: "Preencha os dados do agendamento" });
        }

        try {
            await agendamentoServices.verificarDisponibilidade(
                dados,
                req.body.ignorar_agendamento_id ?? null
            );
            return res.status(200).json({ disponivel: true, message: "Horário disponível" });
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async cadastrar(req, res) {
        const dados = extrairDados(req.body);
        const obrigatorios = [
            dados.clienteId,
            dados.profissionalId,
            dados.dataAgendamento,
            dados.horaInicio,
            dados.horaFim,
            dados.ambiente,
            dados.tipoFaxina
        ];

        if (possuiCampoVazio(obrigatorios)) {
            return res.status(422).json({ message: "Preencha todos os campos obrigatórios" });
        }

        try {
            const resultado = await agendamentoServices.cadastrar(dados);
            return res.status(201).json({
                message: "Agendamento cadastrado com sucesso",
                agendamento: resultado.rows[0]
            });
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async listar(req, res) {
        try {
            const resultado = await agendamentoServices.listar();
            return res.status(200).json(resultado.rows);
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async listarHistorico(req, res) {
        try {
            const resultado = await agendamentoServices.listarHistorico();
            return res.status(200).json(resultado.rows);
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async buscarPorId(req, res) {
        try {
            const resultado = await agendamentoServices.buscarPorId(req.params.id);
            return res.status(200).json(resultado.rows[0]);
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async alterar(req, res) {
        const dados = extrairDados(req.body);
        const obrigatorios = [
            dados.clienteId,
            dados.profissionalId,
            dados.dataAgendamento,
            dados.horaInicio,
            dados.horaFim,
            dados.ambiente,
            dados.tipoFaxina,
            dados.status
        ];

        if (possuiCampoVazio(obrigatorios)) {
            return res.status(422).json({ message: "Preencha todos os campos obrigatórios" });
        }

        try {
            const resultado = await agendamentoServices.alterar(req.params.id, dados);
            return res.status(200).json({
                message: "Agendamento alterado com sucesso",
                agendamento: resultado.rows[0]
            });
        } catch (error) {
            return responderErro(error, res);
        }
    }

    async cancelar(req, res) {
        try {
            const resultado = await agendamentoServices.cancelar(req.params.id);
            return res.status(200).json({
                message: "Agendamento cancelado com sucesso",
                agendamento: resultado.rows[0]
            });
        } catch (error) {
            return responderErro(error, res);
        }
    }
}

export const agendamentoController = new AgendamentoController();
