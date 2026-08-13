import { useEffect } from 'react'
import { FiCalendar, FiX } from 'react-icons/fi'

const Modal = ({ children, isOpen, onClose, title, description }) => {
    useEffect(() => {
        if (!isOpen) return undefined

        const fecharComEscape = (event) => {
            if (event.key === 'Escape') onClose?.()
        }

        document.addEventListener('keydown', fecharComEscape)
        return () => document.removeEventListener('keydown', fecharComEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 p-4 backdrop-blur-sm"
            onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
            role="dialog"
        >
            <div className=" w-full h-180 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest shadow-soft">
                <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <FiCalendar aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
                            {description && <p className="text-body-sm text-on-surface-variant">{description}</p>}
                        </div>
                    </div>
                    <button
                        aria-label="Fechar modal"
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                        onClick={onClose}
                        type="button"
                    >
                        <FiX className="h-5 w-5" aria-hidden="true" />
                    </button>
                </header>
                {children}
            </div>
        </div>
    )
}

export default Modal
