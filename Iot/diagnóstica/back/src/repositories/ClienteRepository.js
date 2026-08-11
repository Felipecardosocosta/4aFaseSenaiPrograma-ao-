import { pool } from "../config/db.js";

class ClienteRepository {
    async buscarClientePorEmail(email) {
        return pool.query("SELECT * FROM cliente WHERE email = $1", [email]);
    }

    async buscarClientePorCpf(cpf) {
        return pool.query("SELECT * FROM cliente WHERE cpf = $1", [cpf]);
    }

    async cadastrarCliente({ nome, cpf, email, cep, rua, numero, tipo }) {
        return pool.query(
            `INSERT INTO cliente (nome, cpf, email, cep, rua, numero, tipo)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [nome, cpf, email, cep, rua, numero, tipo]
        );
    }
}

export const clienteRepository = new ClienteRepository();
