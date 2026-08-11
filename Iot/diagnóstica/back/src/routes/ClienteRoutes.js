import { Router } from "express";
import { clienteController } from "../controller/ClienteController.js";

const clienteRouter = Router();

clienteRouter.post("/cadastro", clienteController.cadastrar);

export default clienteRouter;
