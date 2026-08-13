import { dashboardRepository } from "../repositories/DashboardRepository.js";

class DashboardServices {
    async buscarResumo() {
        const [metricasResultado, agendamentosResultado] = await Promise.all([
            dashboardRepository.buscarMetricas(),
            dashboardRepository.listarAgendamentosHoje()
        ]);

        const metricas = metricasResultado.rows[0];

        return {
            metricas: {
                agendamentosHoje: Number(metricas.agendamentos_hoje),
                pendentes: Number(metricas.pendentes),
                concluidos: Number(metricas.concluidos),
                profissionais: Number(metricas.profissionais)
            },
            agendamentosHoje: agendamentosResultado.rows
        };
    }
}

export const dashboardServices = new DashboardServices();
