import { pool } from "../config/db.js";

class DashboardRepository {
    async buscarMetricas() {
        return pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE data_agendamento = CURRENT_DATE) AS agendamentos_hoje,
                COUNT(*) FILTER (WHERE status = 'PENDENTE') AS pendentes,
                COUNT(*) FILTER (WHERE status = 'CONCLUIDO') AS concluidos,
                (SELECT COUNT(*) FROM profissional) AS profissionais
            FROM agendamento
        `);
    }

    async listarAgendamentosHoje() {
        return pool.query(`
            SELECT
                a.id,
                a.data_agendamento,
                a.hora_inicio,
                a.hora_fim,
                a.ambiente,
                a.tipo_faxina,
                a.status,
                c.nome AS cliente_nome,
                c.rua AS cliente_rua,
                c.numero AS cliente_numero,
                p.nome AS profissional_nome
            FROM agendamento a
            INNER JOIN cliente c ON c.id = a.cliente_id
            INNER JOIN profissional p ON p.id = a.profissional_id
            WHERE a.data_agendamento = CURRENT_DATE
            ORDER BY a.hora_inicio ASC
        `);
    }
}

export const dashboardRepository = new DashboardRepository();
