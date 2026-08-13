import express from "express";
import cors from "cors";
import { pool } from "./config/db.js";
import usuarioRouter from "./routes/UsuarioRoutes.js";
import clienteRouter from "./routes/ClienteRoutes.js";
import profissionalRouter from "./routes/ProfissionalRoutes.js";
import agendamentoRouter from "./routes/AgendamentoRoutes.js";
import dashboardRouter from "./routes/DashboardRoutes.js";
import { authToken } from "./middleware/authToken.js";




const app = express()

app.use(express.json())

app.use(cors())

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})


app.use('/usuario', usuarioRouter)
app.use('/cliente', authToken, clienteRouter)
app.use('/profissional', authToken, profissionalRouter)
app.use('/agendamento', authToken, agendamentoRouter)
app.use('/dashboard', authToken, dashboardRouter)




export default app
