import { createBrowserRouter } from "react-router"
import Login from "../pages/Login"





const router = createBrowserRouter([

    {
        path: '/',
        element: <Login />

    }
    // , {
    //     element: (
    //         <PrivateRouter>
    //             <DashboardLayouts />
    //         </PrivateRouter>
    //     ), children: [
    //         { path: "/dashboard", element: <DashBoard /> },
    //         { path: "/pacientes", element: <RegisterFormPatient /> },
    //         { path: "/prontuarios", element: <MedicalRecordList /> },
    //         { path: "/consultas", element: <ConsultarionForm/> },
    //         { path: "/exames", element: <ExamsForm/> },
    //         { path: "/exames-list", element: <ExamsList/> },
    //         { path: "/paciente/:id", element: <PatientDetails/> }

    //     ]
    // },
])

export default router