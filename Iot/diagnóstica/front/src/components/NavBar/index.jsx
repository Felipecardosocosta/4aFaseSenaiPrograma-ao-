import { NavLink, useNavigate } from 'react-router'
import {
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiGrid,
    FiHelpCircle,
    FiLogOut,
    FiTool,
    FiUsers,
    FiUserPlus,
    FiX,
} from 'react-icons/fi'

const itensMenu = [
    { descricao: 'Painel de controle', Icone: FiGrid, rota: '/dashboard' },
    { descricao: 'Agendamentos', Icone: FiCalendar, rota: "/agendamentos" },
    { descricao: 'Cadastrar cliente', Icone: FiUserPlus, rota: '/cadastro-cliente' },
    { descricao: 'Cadastrar profissional', Icone: FiUsers, rota: '/cadastro-profissional' },
    { descricao: 'Gestão de agenda', Icone: FiUsers, rota: '/gestao-agendamentos' },
    { descricao: 'Serviços', Icone: FiTool },
]

const NavBar = ({ menuMobileAberto, onFecharMobile, onRecolher, recolhido }) => {
    const navigate = useNavigate()

    const sair = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    const conteudoItem = (item) => {
        const { Icone } = item

        return (
            <>
                <Icone className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={`whitespace-nowrap transition-opacity ${recolhido ? 'md:hidden' : ''}`}>
                    {item.descricao}
                </span>
            </>
        )
    }

    return (
        <>
            {menuMobileAberto && (
                <button
                    aria-label="Fechar menu"
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={onFecharMobile}
                    type="button"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-outline-variant bg-surface-container-low py-4 transition-all duration-300 ${recolhido ? 'md:w-20' : 'md:w-64'
                    } ${menuMobileAberto ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}`}
            >
                <div className={`mb-7 flex items-center gap-3 px-4 ${recolhido ? 'md:justify-center' : ''}`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                        <FiTool className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className={recolhido ? 'md:hidden' : ''}>
                        <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-primary">CleanCare</h1>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Gestão profissional</p>
                    </div>
                    <button
                        aria-label="Fechar menu"
                        className="ml-auto rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high md:hidden"
                        onClick={onFecharMobile}
                        type="button"
                    >
                        <FiX className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-2" aria-label="Menu principal">
                    {itensMenu.map((item) => item.rota ? (
                        <NavLink
                            className={({ isActive }) => `${isActive ? 'nav-item-active' : 'nav-item-inactive'} flex w-full items-center gap-3 px-3 py-3 ${recolhido ? 'md:justify-center' : ''}`}
                            key={item.descricao}
                            onClick={onFecharMobile}
                            title={recolhido ? item.descricao : undefined}
                            to={item.rota}
                        >
                            {conteudoItem(item)}
                        </NavLink>
                    ) : (
                        <button
                            className={`nav-item-inactive flex w-full items-center gap-3 px-3 py-3 text-left opacity-60 ${recolhido ? 'md:justify-center' : ''}`}
                            key={item.descricao}
                            title={`${item.descricao} — em breve`}
                            type="button"
                        >
                            {conteudoItem(item)}
                        </button>
                    ))}
                </nav>

                <div className="flex flex-col gap-2 border-t border-outline-variant/30 px-2 pt-4">
                    <button
                        className={`nav-item-inactive flex w-full items-center gap-3 px-3 py-3 text-left ${recolhido ? 'md:justify-center' : ''}`}
                        title={recolhido ? 'Suporte' : undefined}
                        type="button"
                    >
                        <FiHelpCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className={recolhido ? 'md:hidden' : ''}>Suporte</span>
                    </button>
                    <button
                        className={`nav-item-inactive flex w-full items-center gap-3 px-3 py-3 text-left ${recolhido ? 'md:justify-center' : ''}`}
                        onClick={sair}
                        title={recolhido ? 'Sair' : undefined}
                        type="button"
                    >
                        <FiLogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className={recolhido ? 'md:hidden' : ''}>Sair</span>
                    </button>
                </div>

                <button
                    aria-label={recolhido ? 'Expandir menu' : 'Recolher menu'}
                    className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-on-surface shadow-md hover:bg-surface-container-high md:flex"
                    onClick={onRecolher}
                    title={recolhido ? 'Expandir menu' : 'Recolher menu'}
                    type="button"
                >
                    {recolhido
                        ? <FiChevronRight className="h-4 w-4" aria-hidden="true" />
                        : <FiChevronLeft className="h-4 w-4" aria-hidden="true" />}
                </button>
            </aside>
        </>
    )
}

export default NavBar
