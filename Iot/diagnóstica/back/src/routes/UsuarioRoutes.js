import { Router } from "express";
import { usuarioController } from "../controller/UsuarioController.js";
import { authStatus } from "../middleware/authStatus.js";


const usuarioRouter = Router()



usuarioRouter.post("/login", usuarioController.login)


usuarioRouter.post("/cadastro", usuarioController.cadastrar)


usuarioRouter.use(authStatus(["ADMIN"]))

usuarioRouter.put("/mudarpermicao", usuarioController.mudarStatus)



export default usuarioRouter
