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
    async cadastro({ nome, email, cpf, senha, tipo }) {
        const tipoNormalizado = String(tipo).toUpperCase();
        const tiposAceitos = ["PESADA", "MEDIA", "LEVE", "TODOS"];

        if (!tiposAceitos.includes(tipoNormalizado)) {
            throw new ProfissionalServiceError("Tipo de faxina inválido", "DADOS_INVALIDOS");
        }

        const [profissionalPorEmail, profissionalPorCpf] = await Promise.all([
            profissionalRepository.buscarProfissionalPorEmail(email),
            profissionalRepository.buscarProfissionalPorCpf(cpf)
        ]);

        if (profissionalPorEmail.rows.length > 0 || profissionalPorCpf.rows.length > 0) {
            throw new ProfissionalServiceError(
                "CPF ou email já cadastrado",
                "PROFISSIONAL_DUPLICADO"
            );
        }

        const senhaHash = await createHash(senha);

        try {
            return await profissionalRepository.cadastrarProfissional({
                nome,
                email,
                cpf,
                senha: senhaHash,
                tipo: tipoNormalizado
            });
        } catch (error) {
            if (error.code === "23505") {
                throw new ProfissionalServiceError(
                    "CPF ou email já cadastrado",
                    "PROFISSIONAL_DUPLICADO"
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
