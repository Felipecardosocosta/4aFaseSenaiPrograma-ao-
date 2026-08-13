import { dashboardServices } from "../services/DashboardServices.js";

class DashboardController {
    async buscarResumo(req, res) {
        try {
            const resumo = await dashboardServices.buscarResumo();
            return res.status(200).json(resumo);
        } catch (error) {
            console.error("Erro ao buscar resumo do painel:", error);
            return res.status(500).json({ message: "Não foi possível carregar o painel de controle" });
        }
    }
}

export const dashboardController = new DashboardController();
