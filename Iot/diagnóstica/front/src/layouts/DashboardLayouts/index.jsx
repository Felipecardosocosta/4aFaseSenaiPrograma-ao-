import { useState } from 'react'
import { Outlet } from 'react-router'
import NavBar from '../../components/NavBar'
import HeaderSearch from '../../components/HeaderSearch'

const DashboardLayouts = () => {
    const [menuRecolhido, setMenuRecolhido] = useState(false)
    const [menuMobileAberto, setMenuMobileAberto] = useState(false)



    return (
        <div className="flex h-screen overflow-hidden bg-background font-body-md text-body-md">
            <NavBar
                menuMobileAberto={menuMobileAberto}
                onFecharMobile={() => setMenuMobileAberto(false)}
                onRecolher={() => setMenuRecolhido((valorAtual) => !valorAtual)}
                recolhido={menuRecolhido}
            />

            <div
                className={`flex h-screen min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-300 ${menuRecolhido ? 'md:ml-28' : 'md:ml-68'
                    }`}
            >
                <HeaderSearch onAbrirMenu={() => setMenuMobileAberto(true)} />
                <Outlet />
            </div>
        </div>
    )
}

export default DashboardLayouts
