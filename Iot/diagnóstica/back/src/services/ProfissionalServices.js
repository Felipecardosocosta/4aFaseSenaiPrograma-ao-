import { profissionalRepository } from "../repositories/ProfissionalRepository.js";
import { createHash } from "../utils/createHash.js";

export class ProfissionalServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = "ProfissionalServiceError";
        this.code = code;
    }
}

function validarHorarios(horaInicio, horaFim) {
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

    if (!formatoHora.test(horaInicio) || !formatoHora.test(horaFim)) {
        throw new ProfissionalServiceError("Formato de horário inválido", "DADOS_INVALIDOS");
    }

    const paraSegundos = (hora) => {
        const [horas, minutos, segundos = "0"] = hora.split(":").map(Number);
        return horas * 3600 + minutos * 60 + segundos;
    };

    if (paraSegundos(horaFim) <= paraSegundos(horaInicio)) {
        throw new ProfissionalServiceError(
            "A hora final deve ser posterior à hora inicial",
            "DADOS_INVALIDOS"
        );
    }
}

class ProfissionalServices {
    async listar() {
        return profissionalRepository.listarProfissionais();
    }

    async cadastro({ nome, email, cpf, senha, tipo, disponibilidades = [] }) {
        const nomeNormalizado = String(nome).trim();
        const emailNormalizado = String(email).trim().toLowerCase();
        const cpfNormalizado = String(cpf).replace(/\D/g, "");
        const tipoNormalizado = String(tipo).toUpperCase();
        const tiposAceitos = ["PESADA", "MEDIA", "LEVE", "TODOS"];

        if (nomeNormalizado.length < 3) {
            throw new ProfissionalServiceError("Nome inválido", "DADOS_INVALIDOS");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
            throw new ProfissionalServiceError("E-mail inválido", "DADOS_INVALIDOS");
        }

        if (!/^\d{11}$/.test(cpfNormalizado)) {
            throw new ProfissionalServiceError("CPF inválido", "DADOS_INVALIDOS");
        }

        if (String(senha).length < 8) {
            throw new ProfissionalServiceError(
                "A senha deve possuir pelo menos 8 caracteres",
                "DADOS_INVALIDOS"
            );
        }

        if (!tiposAceitos.includes(tipoNormalizado)) {
            throw new ProfissionalServiceError("Tipo de faxina inválido", "DADOS_INVALIDOS");
        }

        if (!Array.isArray(disponibilidades)) {
            throw new ProfissionalServiceError("Disponibilidades inválidas", "DADOS_INVALIDOS");
        }

        const disponibilidadesNormalizadas = disponibilidades.map((periodo) => {
            const hoje = new Date().toISOString().slice(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(periodo?.data_disponivel || "") || periodo.data_disponivel < hoje) {
                throw new ProfissionalServiceError("Informe a data da disponibilidade", "DADOS_INVALIDOS");
            }
            validarHorarios(periodo.hora_inicio, periodo.hora_fim);
            return {
                dataDisponivel: periodo.data_disponivel,
                horaInicio: periodo.hora_inicio,
                horaFim: periodo.hora_fim,
                disponivel: periodo.disponivel !== false
            };
        });

        const [profissionalPorEmail, profissionalPorCpf] = await Promise.all([
            profissionalRepository.buscarProfissionalPorEmail(emailNormalizado),
            profissionalRepository.buscarProfissionalPorCpf(cpfNormalizado)
        ]);

        if (profissionalPorEmail.rows.length > 0 || profissionalPorCpf.rows.length > 0) {
            throw new ProfissionalServiceError(
                "CPF ou email já cadastrado",
                "PROFISSIONAL_DUPLICADO"
            );
        }

        const senhaHash = await createHash(senha);

        try {
            return await profissionalRepository.cadastrarProfissionalComDisponibilidades({
                nome: nomeNormalizado,
                email: emailNormalizado,
                cpf: cpfNormalizado,
                senha: senhaHash,
                tipo: tipoNormalizado,
                disponibilidades: disponibilidadesNormalizadas
            });
        } catch (error) {
            if (error.code === "23505") {
                throw new ProfissionalServiceError(
                    "CPF ou email já cadastrado",
                    "PROFISSIONAL_DUPLICADO"
                );
            }

            if (error.code === "23P01") {
                throw new ProfissionalServiceError(
                    "Existem períodos de disponibilidade sobrepostos",
                    "DADOS_INVALIDOS"
                );
            }

            if (error.code === "23514") {
                throw new ProfissionalServiceError(
                    "Período de disponibilidade inválido",
                    "DADOS_INVALIDOS"
                );
            }

            throw error;
        }
    }

    async cadastrarDisponibilidade({
        profissionalId,
        dataDisponivel,
        horaInicio,
        horaFim,
        disponivel = true
    }) {
        const profissional = await profissionalRepository.buscarProfissionalPorId(profissionalId);

        if (profissional.rows.length === 0) {
            throw new ProfissionalServiceError(
                "Profissional não encontrado",
                "REGISTRO_NAO_ENCONTRADO"
            );
        }

        if (typeof disponivel !== "boolean") {
            throw new ProfissionalServiceError("Disponibilidade inválida", "DADOS_INVALIDOS");
        }

        validarHorarios(horaInicio, horaFim);

        return profissionalRepository.cadastrarDisponibilidade({
            profissionalId,
            dataDisponivel,
            horaInicio,
            horaFim,
            disponivel
        });
    }

    async alterarDisponibilidade({ id, dataDisponivel, horaInicio, horaFim, disponivel }) {
        const disponibilidadeExistente =
            await profissionalRepository.buscarDisponibilidadePorId(id);

        if (disponibilidadeExistente.rows.length === 0) {
            throw new ProfissionalServiceError(
                "Disponibilidade não encontrada",
                "REGISTRO_NAO_ENCONTRADO"
            );
        }

        if (typeof disponivel !== "boolean") {
            throw new ProfissionalServiceError("Disponibilidade inválida", "DADOS_INVALIDOS");
        }

        validarHorarios(horaInicio, horaFim);

        return profissionalRepository.atualizarDisponibilidade({
            id,
            dataDisponivel,
            horaInicio,
            horaFim,
            disponivel
        });
    }
}

export const profissionalServices = new ProfissionalServices();
