import { clienteRepository } from "../repositories/ClienteRepository.js";

export class ClienteServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = "ClienteServiceError";
        this.code = code;
    }
}

class ClienteServices {
    async cadastro({ nome, cpf, email, cep, rua, numero, tipo }) {
        const tipoNormalizado = String(tipo).toUpperCase();
        const tiposAceitos = ["PESADA", "MEDIA", "LEVE", "TODOS"];

        if (!tiposAceitos.includes(tipoNormalizado)) {
            throw new ClienteServiceError("Tipo de faxina inválido", "TIPO_INVALIDO");
        }

        const [clientePorEmail, clientePorCpf] = await Promise.all([
            clienteRepository.buscarClientePorEmail(email),
            clienteRepository.buscarClientePorCpf(cpf)
        ]);

        if (clientePorEmail.rows.length > 0 || clientePorCpf.rows.length > 0) {
            throw new ClienteServiceError("CPF ou email já cadastrado", "CLIENTE_DUPLICADO");
        }

        try {
            return await clienteRepository.cadastrarCliente({
                nome,
                cpf,
                email,
                cep,
                rua,
                numero,
                tipo: tipoNormalizado
            });
        } catch (error) {
            if (error.code === "23505") {
                throw new ClienteServiceError("CPF ou email já cadastrado", "CLIENTE_DUPLICADO");
            }

            throw error;
        }
    }
}

export const clienteServices = new ClienteServices();
