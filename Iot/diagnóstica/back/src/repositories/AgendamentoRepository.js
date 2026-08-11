import { pool } from "../config/db.js";

const consultaComRelacionamentos = `
    SELECT
        a.*,
        c.nome AS cliente_nome,
        p.nome AS profissional_nome
    FROM agendamento a
    INNER JOIN cliente c ON c.id = a.cliente_id
    INNER JOIN profissional p ON p.id = a.profissional_id
`;

class AgendamentoRepository {
    async buscarClientePorId(id) {
        return pool.query("SELECT id FROM cliente WHERE id = $1", [id]);
    }

    async buscarProfissionalPorId(id) {
        return pool.query("SELECT id FROM profissional WHERE id = $1", [id]);
    }

    async buscarAgendamentoPorId(id) {
        return pool.query(`${consultaComRelacionamentos} WHERE a.id = $1`, [id]);
    }

    async listarAgendamentos() {
        return pool.query(
            `${consultaComRelacionamentos}
             ORDER BY a.data_agendamento DESC, a.hora_inicio DESC`
        );
    }

    async listarHistorico() {
        return pool.query(
            `${consultaComRelacionamentos}
             WHERE a.status IN ('CONCLUIDO', 'CANCELADO')
             ORDER BY a.data_agendamento DESC, a.hora_inicio DESC`
        );
    }

    async buscarDisponibilidade({ profissionalId, dataAgendamento, horaInicio, horaFim }) {
        return pool.query(
            `SELECT id
             FROM disponibilidade_profissional
             WHERE profissional_id = $1
               AND data_disponivel = $2
               AND disponivel = TRUE
               AND hora_inicio <= $3
               AND hora_fim >= $4
             LIMIT 1`,
            [profissionalId, dataAgendamento, horaInicio, horaFim]
        );
    }

    async buscarConflito({
        profissionalId,
        dataAgendamento,
        horaInicio,
        horaFim,
        ignorarAgendamentoId = null
    }) {
        return pool.query(
            `SELECT id
             FROM agendamento
             WHERE profissional_id = $1
               AND data_agendamento = $2
               AND status <> 'CANCELADO'
               AND hora_inicio < $4
               AND hora_fim > $3
               AND ($5::uuid IS NULL OR id <> $5::uuid)
             LIMIT 1`,
            [
                profissionalId,
                dataAgendamento,
                horaInicio,
                horaFim,
                ignorarAgendamentoId
            ]
        );
    }

    async cadastrarAgendamento({
        clienteId,
        profissionalId,
        dataAgendamento,
        horaInicio,
        horaFim,
        ambiente,
        tipoFaxina,
        status,
        observacoes
    }) {
        return pool.query(
            `INSERT INTO agendamento (
                cliente_id,
                profissional_id,
                data_agendamento,
                hora_inicio,
                hora_fim,
                ambiente,
                tipo_faxina,
                status,
                observacoes
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                clienteId,
                profissionalId,
                dataAgendamento,
                horaInicio,
                horaFim,
                ambiente,
                tipoFaxina,
                status,
                observacoes
            ]
        );
    }

    async atualizarAgendamento({
        id,
        clienteId,
        profissionalId,
        dataAgendamento,
        horaInicio,
        horaFim,
        ambiente,
        tipoFaxina,
        status,
        observacoes
    }) {
        return pool.query(
            `UPDATE agendamento
             SET cliente_id = $1,
                 profissional_id = $2,
                 data_agendamento = $3,
                 hora_inicio = $4,
                 hora_fim = $5,
                 ambiente = $6,
                 tipo_faxina = $7,
                 status = $8,
                 observacoes = $9,
                 atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $10
             RETURNING *`,
            [
                clienteId,
                profissionalId,
                dataAgendamento,
                horaInicio,
                horaFim,
                ambiente,
                tipoFaxina,
                status,
                observacoes,
                id
            ]
        );
    }

    async cancelarAgendamento(id) {
        return pool.query(
            `UPDATE agendamento
             SET status = 'CANCELADO', atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [id]
        );
    }
}

export const agendamentoRepository = new AgendamentoRepository();
