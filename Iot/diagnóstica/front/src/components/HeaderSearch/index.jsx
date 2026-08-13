import { useNavigate } from 'react-router'
import { FiBell, FiLogOut, FiMenu } from 'react-icons/fi'

const HeaderSearch = ({ onAbrirMenu }) => {
  const navigate = useNavigate()

  const sair = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-16 w-full items-center gap-3 border-b border-outline-variant/40 bg-surface/95 px-4 shadow-sm backdrop-blur-md md:h-16 md:px-6">
      <button
        aria-label="Abrir menu"
        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high md:hidden"
        onClick={onAbrirMenu}
        type="button"
      >
        <FiMenu className="h-6 w-6" aria-hidden="true" />
      </button>

      <span className="font-headline-sm text-headline-sm font-bold text-primary md:hidden">CleanCare</span>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          aria-label="Notificações"
          className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
          title="Notificações"
          type="button"
        >
          <FiBell className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="hidden text-right sm:block">
          <p className="font-label-md text-label-md text-on-surface">Administrador</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Painel administrativo</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg px-2 py-2 font-label-md text-label-md text-primary hover:bg-surface-container-high"
          onClick={sair}
          title="Sair da conta"
          type="button"
        >
          <FiLogOut className="h-5 w-5" aria-hidden="true" />
          <span className="hidden lg:inline">Sair</span>
        </button>
      </div>
    </header>
  )
}

export default HeaderSearch
