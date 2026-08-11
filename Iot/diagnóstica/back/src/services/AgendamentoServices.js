import { agendamentoRepository } from "../repositories/AgendamentoRepository.js";

export class AgendamentoServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = "AgendamentoServiceError";
        this.code = code;
    }
}

function normalizarEValidarDados(dados) {
    const ambiente = String(dados.ambiente).toUpperCase();
    const tipoFaxina = String(dados.tipoFaxina).toUpperCase();
    const status = String(dados.status ?? "PENDENTE").toUpperCase();
    const ambientesAceitos = ["RESIDENCIAL", "COMERCIAL"];
    const tiposAceitos = ["PESADA", "MEDIA", "LEVE", "TODOS"];
    const statusAceitos = ["PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"];
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

    if (!ambientesAceitos.includes(ambiente)) {
        throw new AgendamentoServiceError("Ambiente inválido", "DADOS_INVALIDOS");
    }

    if (!tiposAceitos.includes(tipoFaxina)) {
        throw new AgendamentoServiceError("Tipo de faxina inválido", "DADOS_INVALIDOS");
    }

    if (!statusAceitos.includes(status)) {
        throw new AgendamentoServiceError("Status inválido", "DADOS_INVALIDOS");
    }

    if (!formatoHora.test(dados.horaInicio) || !formatoHora.test(dados.horaFim)) {
        throw new AgendamentoServiceError("Formato de horário inválido", "DADOS_INVALIDOS");
    }

    const paraSegundos = (hora) => {
        const [horas, minutos, segundos = "0"] = hora.split(":").map(Number);
        return horas * 3600 + minutos * 60 + segundos;
    };

    if (paraSegundos(dados.horaFim) <= paraSegundos(dados.horaInicio)) {
        throw new AgendamentoServiceError(
            "A hora final deve ser posterior à hora inicial",
            "DADOS_INVALIDOS"
        );
    }

    return { ambiente, tipoFaxina, status };
}

class AgendamentoServices {
    async validarRelacionamentosEHorario(dados, ignorarAgendamentoId = null) {
        const [cliente, profissional] = await Promise.all([
            agendamentoRepository.buscarClientePorId(dados.clienteId),
            agendamentoRepository.buscarProfissionalPorId(dados.profissionalId)
        ]);

        if (cliente.rows.length === 0) {
            throw new AgendamentoServiceError("Cliente não encontrado", "REGISTRO_NAO_ENCONTRADO");
        }

        if (profissional.rows.length === 0) {
            throw new AgendamentoServiceError(
                "Profissional não encontrado",
                "REGISTRO_NAO_ENCONTRADO"
            );
        }

        if (dados.status === "CANCELADO") {
            return;
        }

        const disponibilidade = await agendamentoRepository.buscarDisponibilidade(dados);

        if (disponibilidade.rows.length === 0) {
            throw new AgendamentoServiceError(
                "Profissional indisponível no período informado",
                "PROFISSIONAL_INDISPONIVEL"
            );
        }

        const conflito = await agendamentoRepository.buscarConflito({
            ...dados,
            ignorarAgendamentoId
        });

        if (conflito.rows.length > 0) {
            throw new AgendamentoServiceError(
                "Já existe agendamento para o profissional nesse horário",
                "HORARIO_CONFLITANTE"
            );
        }
    }

    async cadastrar(dados) {
        const normalizados = normalizarEValidarDados(dados);
        const agendamento = { ...dados, ...normalizados };

        await this.validarRelacionamentosEHorario(agendamento);
        return agendamentoRepository.cadastrarAgendamento(agendamento);
    }

    async listar() {
        return agendamentoRepository.listarAgendamentos();
    }

    async listarHistorico() {
        return agendamentoRepository.listarHistorico();
    }

    async buscarPorId(id) {
        const agendamento = await agendamentoRepository.buscarAgendamentoPorId(id);

        if (agendamento.rows.length === 0) {
            throw new AgendamentoServiceError(
                "Agendamento não encontrado",
                "REGISTRO_NAO_ENCONTRADO"
            );
        }

        return agendamento;
    }

    async alterar(id, dados) {
        await this.buscarPorId(id);
        const normalizados = normalizarEValidarDados(dados);
        const agendamento = { id, ...dados, ...normalizados };

        await this.validarRelacionamentosEHorario(agendamento, id);
        return agendamentoRepository.atualizarAgendamento(agendamento);
    }

    async cancelar(id) {
        const agendamento = await this.buscarPorId(id);

        if (agendamento.rows[0].status === "CANCELADO") {
            throw new AgendamentoServiceError(
                "Agendamento já está cancelado",
                "DADOS_INVALIDOS"
            );
        }

        return agendamentoRepository.cancelarAgendamento(id);
    }
}

export const agendamentoServices = new AgendamentoServices();
