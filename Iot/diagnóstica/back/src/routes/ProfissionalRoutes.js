import { Router } from "express";
import { profissionalController } from "../controller/ProfissionalController.js";

const profissionalRouter = Router();

profissionalRouter.post("/cadastro", profissionalController.cadastrar);
profissionalRouter.post(
    "/:profissionalId/disponibilidade",
    profissionalController.cadastrarDisponibilidade
);
profissionalRouter.put(
    "/disponibilidade/:id",
    profissionalController.alterarDisponibilidade
);

export default profissionalRouter;
