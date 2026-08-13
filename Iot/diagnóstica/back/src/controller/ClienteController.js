import {
    ClienteServiceError,
    clienteServices
} from "../services/ClienteServices.js";

class ClienteController {
    async listar(req, res) {
        try {
            const resultado = await clienteServices.listar();
            return res.status(200).json(resultado.rows);
        } catch (error) {
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
    }

    async cadastrar(req, res) {
        const { nome, cpf, email, cep, rua, numero, tipo } = req.body;
        const campos = [nome, cpf, email, cep, rua, numero, tipo];

        const possuiCampoVazio = campos.some(
            (campo) => campo === undefined || campo === null || String(campo).trim() === ""
        );

        if (possuiCampoVazio) {
            return res.status(422).json({ message: "Preencha todos os campos obrigatórios" });
        }

        try {
            const resultado = await clienteServices.cadastro({ nome, cpf, email, cep, rua, numero, tipo });

            return res.status(201).json({
                message: "Cliente cadastrado com sucesso",
                cliente: resultado.rows[0]
            });
        } catch (error) {
            if (error instanceof ClienteServiceError) {
                const status = error.code === "CLIENTE_DUPLICADO" ? 409 : 422;
                return res.status(status).json({ message: error.message });
            }

            return res.status(500).json({ message: "Erro interno no servidor" });
        }
    }
}

export const clienteController = new ClienteController();
