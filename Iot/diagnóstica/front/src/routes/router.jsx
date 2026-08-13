import { createBrowserRouter } from "react-router"
import Login from "../pages/Login"
import DashboardLayouts from "../layouts/DashboardLayouts"
import PainelControle from "../pages/PainelControle"
import Agendamentos from "../pages/Agendamentos"
import CadastroCliente from "../pages/CadastroCliente"
import CadastroProfissional from "../pages/CadastroProficional"
import GestaoAgendamentos from "../pages/GestaoAgendamentos"
import CadastroUsuario from "../pages/CadastroUsuario"






const router = createBrowserRouter([

    {
        path: '/',
        element: <Login />

    },
    {
        path: '/cadastro',
        element: <CadastroUsuario />
    }
    , {
        element: (
            <DashboardLayouts />
        ), children: [
            { path: "/dashboard", element: <PainelControle /> },
            { path: "/agendamentos", element: <Agendamentos /> },
            { path: "/cadastro-cliente", element: <CadastroCliente /> },
            { path: "/cadastro-profissional", element: <CadastroProfissional /> },
            { path: "/gestao-agendamentos", element: <GestaoAgendamentos /> },



        ]
    },
])

export default router
