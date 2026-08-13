import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiMapPin,
    FiRefreshCw,
    FiSearch,
    FiUsers,
    FiX,
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const metricasVazias = {
    agendamentosHoje: null,
    pendentes: null,
    concluidos: null,
    profissionais: null,
}

const configuracaoStatus = {
    PENDENTE: { texto: 'Pendente', classe: 'bg-surface-variant text-on-surface-variant border-outline-variant' },
    CONFIRMADO: { texto: 'Confirmado', classe: 'bg-primary/10 text-primary border-primary/20' },
    CONCLUIDO: { texto: 'Concluído', classe: 'bg-secondary/10 text-secondary border-secondary/20' },
    CANCELADO: { texto: 'Cancelado', classe: 'bg-error/10 text-error border-error/20' },
}

const formatarHora = (hora) => hora ? String(hora).slice(0, 5) : '—'

const normalizarTexto = (valor) => String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()

const CartaoMetrica = ({ Icone, titulo, valor, detalhe, corIcone }) => (
    <article className="flex min-h-36 flex-col justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-soft transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">{titulo}</p>
                <h3 className="mt-2 font-headline-md text-headline-md text-on-surface">{valor ?? '—'}</h3>
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${corIcone}`}>
                <Icone className="h-5 w-5" aria-hidden="true" />
            </div>
        </div>
        <p className="mt-4 font-label-sm text-label-sm text-on-surface-variant">{detalhe}</p>
    </article>
)

const PainelControle = () => {


    const [busca, setBusca] = useState("")
    const [metricas, setMetricas] = useState(metricasVazias)
    const [agendamentos, setAgendamentos] = useState([])
    const [carregando, setCarregando] = useState(true)


    const carregarResumo = useCallback(async (signal) => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.get(`${API_URL}/dashboard/resumo`, {
                headers: { Authorization: `Bearer ${token || ''}` },
                signal,
            })

            setMetricas({ ...metricasVazias, ...data.metricas })
            setAgendamentos(Array.isArray(data.agendamentosHoje) ? data.agendamentosHoje : [])
        } catch (error) {
            if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return

            setMetricas(metricasVazias)
            setAgendamentos([])
            toast.error(error.response?.data?.message || 'Não foi possível carregar os dados do painel.')
        } finally {
            if (!signal?.aborted) setCarregando(false)
        }
    }, [])

    useEffect(() => {

        const controller = new AbortController()
        const carregamentoInicial = window.setTimeout(() => {
            carregarResumo(controller.signal)
        }, 0)

        return () => {
            window.clearTimeout(carregamentoInicial)
            controller.abort()
        }
    }, [carregarResumo])

    const agendamentosFiltrados = useMemo(() => {
        const termo = normalizarTexto(busca)
        if (!termo) return agendamentos

        return agendamentos.filter((agendamento) => [
            agendamento.cliente_nome,
            agendamento.cliente_rua,
            agendamento.cliente_numero,
            agendamento.profissional_nome,
            agendamento.tipo_faxina,
            agendamento.ambiente,
            agendamento.status,
            configuracaoStatus[agendamento.status]?.texto,
            agendamento.hora_inicio,
            agendamento.hora_fim,
        ].some((valor) => normalizarTexto(valor).includes(termo)))
    }, [agendamentos, busca])

    const horaAtual = new Date().getHours()
    const saudacao = horaAtual < 12 ? 'Bom dia' : horaAtual < 18 ? 'Boa tarde' : 'Boa noite'

    const atualizarResumo = () => {
        setCarregando(true)
        carregarResumo()
    }

    return (
        <section className="flex-1 overflow-y-auto bg-surface-bright p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center">
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">{saudacao}</h2>
                        <label className="relative w-full md:max-w-md">
                            <span className="sr-only">Buscar agendamentos</span>
                            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
                            <input
                                aria-label="Buscar agendamentos"
                                className="h-10 w-100 rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-10 text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                onChange={(event) => setBusca(event.target.value)}
                                placeholder="Buscar cliente, profissional ou serviço..."
                                type="search"
                                value={busca}
                            />
                            {busca && (
                                <button
                                    aria-label="Limpar busca"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                                    onClick={() => setBusca('')}
                                    type="button"
                                >
                                    <FiX className="h-4 w-4" aria-hidden="true" />
                                </button>
                            )}
                        </label>
                    </div>
                    <button
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-wait disabled:opacity-60"
                        disabled={carregando}
                        onClick={atualizarResumo}
                        type="button"
                    >
                        <FiRefreshCw className={`h-4 w-4 ${carregando ? 'animate-spin' : ''}`} aria-hidden="true" />
                        {carregando ? 'Atualizando...' : 'Atualizar'}
                    </button>
                </section>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo do painel">
                    <CartaoMetrica
                        corIcone="bg-primary-fixed-dim/20 text-primary"
                        detalhe="Serviços marcados para a data atual"
                        Icone={FiCalendar}
                        titulo="Agendamentos de hoje"
                        valor={metricas.agendamentosHoje}
                    />
                    <CartaoMetrica
                        corIcone="bg-tertiary-fixed/20 text-tertiary"
                        detalhe="Aguardando confirmação ou atendimento"
                        Icone={FiClock}
                        titulo="Agendamentos pendentes"
                        valor={metricas.pendentes}
                    />
                    <CartaoMetrica
                        corIcone="bg-secondary-fixed-dim/20 text-secondary"
                        detalhe="Serviços finalizados no histórico"
                        Icone={FiCheckCircle}
                        titulo="Agendamentos concluídos"
                        valor={metricas.concluidos}
                    />
                    <CartaoMetrica
                        corIcone="bg-primary-fixed-dim/20 text-primary"
                        detalhe="Profissionais cadastrados no sistema"
                        Icone={FiUsers}
                        titulo="Profissionais"
                        valor={metricas.profissionais}
                    />
                </section>

                <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-soft">
                    <div className="flex flex-col justify-between gap-2 border-b border-outline-variant bg-surface px-5 py-4 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface">Agendamentos de hoje</h3>
                            <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
                                {busca ? `Resultados para “${busca}”` : 'Agenda organizada por horário'}
                            </p>
                        </div>
                        <span className="font-label-md text-label-md text-on-surface-variant">
                            {agendamentosFiltrados.length} {agendamentosFiltrados.length === 1 ? 'registro' : 'registros'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-190 border-collapse text-left">
                            <thead>
                                <tr className="bg-surface-container-low font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                                    <th className="px-5 py-3 font-semibold">Cliente e local</th>
                                    <th className="px-5 py-3 font-semibold">Serviço</th>
                                    <th className="px-5 py-3 font-semibold">Horário</th>
                                    <th className="px-5 py-3 font-semibold">Profissional</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                                {carregando && (
                                    <tr>
                                        <td className="px-5 py-10 text-center text-on-surface-variant" colSpan="5">
                                            Carregando agendamentos...
                                        </td>
                                    </tr>
                                )}

                                {!carregando && agendamentosFiltrados.length === 0 && (
                                    <tr>
                                        <td className="px-5 py-10 text-center text-on-surface-variant" colSpan="5">
                                            {busca ? 'Nenhum agendamento corresponde à busca.' : 'Nenhum agendamento encontrado para hoje.'}
                                        </td>
                                    </tr>
                                )}

                                {!carregando && agendamentosFiltrados.map((agendamento) => {
                                    const status = configuracaoStatus[agendamento.status] || {
                                        texto: agendamento.status || 'Não informado',
                                        classe: 'bg-surface-variant text-on-surface-variant border-outline-variant',
                                    }

                                    return (
                                        <tr className="transition-colors hover:bg-surface-container-low" key={agendamento.id}>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-on-surface">{agendamento.cliente_nome || '—'}</div>
                                                <div className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                                                    <FiMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                    {[agendamento.cliente_rua, agendamento.cliente_numero].filter(Boolean).join(', ') || 'Endereço não informado'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-on-surface-variant">
                                                {String(agendamento.tipo_faxina || '—').toLocaleLowerCase('pt-BR')}
                                                <span className="block font-label-sm text-label-sm capitalize">{String(agendamento.ambiente || '').toLocaleLowerCase('pt-BR')}</span>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-on-surface-variant">
                                                {formatarHora(agendamento.hora_inicio)} – {formatarHora(agendamento.hora_fim)}
                                            </td>
                                            <td className="px-5 py-4 text-on-surface-variant">{agendamento.profissional_nome || 'Não atribuído'}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-label-sm text-label-sm ${status.classe}`}>
                                                    {status.texto}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </section>
    )
}

export default PainelControle
