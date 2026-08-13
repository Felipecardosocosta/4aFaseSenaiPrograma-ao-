import { Router } from "express";
import { agendamentoController } from "../controller/AgendamentoController.js";

const agendamentoRouter = Router();

agendamentoRouter.post("/", agendamentoController.cadastrar);
agendamentoRouter.post("/verificar-disponibilidade", agendamentoController.verificarDisponibilidade);
agendamentoRouter.get("/", agendamentoController.listar);
agendamentoRouter.get("/historico", agendamentoController.listarHistorico);
agendamentoRouter.get("/:id", agendamentoController.buscarPorId);
agendamentoRouter.put("/:id", agendamentoController.alterar);
agendamentoRouter.delete("/:id", agendamentoController.cancelar);

export default agendamentoRouter;
