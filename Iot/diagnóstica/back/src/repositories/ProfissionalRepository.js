import { pool } from "../config/db.js";

class ProfissionalRepository {
    async buscarProfissionalPorId(id) {
        return pool.query("SELECT * FROM profissional WHERE id = $1", [id]);
    }

    async buscarProfissionalPorEmail(email) {
        return pool.query("SELECT * FROM profissional WHERE email = $1", [email]);
    }

    async buscarProfissionalPorCpf(cpf) {
        return pool.query("SELECT * FROM profissional WHERE cpf = $1", [cpf]);
    }

    async cadastrarProfissional({ nome, email, cpf, senha, tipo }) {
        return pool.query(
            `INSERT INTO profissional (nome, email, cpf, senha, tipo)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nome, email, cpf, senha, tipo]
        );
    }

    async buscarDisponibilidadePorId(id) {
        return pool.query(
            "SELECT * FROM disponibilidade_profissional WHERE id = $1",
            [id]
        );
    }

    async cadastrarDisponibilidade({
        profissionalId,
        dataDisponivel,
        horaInicio,
        horaFim,
        disponivel
    }) {
        return pool.query(
            `INSERT INTO disponibilidade_profissional
                (profissional_id, data_disponivel, hora_inicio, hora_fim, disponivel)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [profissionalId, dataDisponivel, horaInicio, horaFim, disponivel]
        );
    }

    async atualizarDisponibilidade({
        id,
        dataDisponivel,
        horaInicio,
        horaFim,
        disponivel
    }) {
        return pool.query(
            `UPDATE disponibilidade_profissional
             SET data_disponivel = $1,
                 hora_inicio = $2,
                 hora_fim = $3,
                 disponivel = $4
             WHERE id = $5
             RETURNING *`,
            [dataDisponivel, horaInicio, horaFim, disponivel, id]
        );
    }
}

export const profissionalRepository = new ProfissionalRepository();
