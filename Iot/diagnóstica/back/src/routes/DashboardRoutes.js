import { Router } from "express";
import { dashboardController } from "../controller/DashboardController.js";

const dashboardRouter = Router();

dashboardRouter.get("/resumo", dashboardController.buscarResumo);

export default dashboardRouter;
