import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
    FiCalendar,
    FiEdit2,
    FiFilter,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTrash2,
    FiUser,
} from 'react-icons/fi'
import Modal from '../../components/Modal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const formularioInicial = {
    cliente_id: '',
    profissional_id: '',
    data_agendamento: '',
    hora_inicio: '',
    hora_fim: '',
    ambiente: 'RESIDENCIAL',
    tipo_faxina: 'LEVE',
    status: 'PENDENTE',
    observacoes: '',
}

const rotulosStatus = {
    PENDENTE: 'Pendente',
    CONFIRMADO: 'Confirmado',
    CONCLUIDO: 'Concluído',
    CANCELADO: 'Cancelado',
}

const classesStatus = {
    PENDENTE: 'border-tertiary/30 bg-tertiary/10 text-tertiary',
    CONFIRMADO: 'border-primary/30 bg-primary/10 text-primary',
    CONCLUIDO: 'border-secondary/30 bg-secondary/10 text-secondary',
    CANCELADO: 'border-error/30 bg-error/10 text-error',
}

const normalizarData = (data) => data ? String(data).slice(0, 10) : ''
const formatarHora = (hora) => hora ? String(hora).slice(0, 5) : '—'
const formatarData = (data) => {
    if (!data) return '—'
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${normalizarData(data)}T00:00:00Z`))
}

const Agendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([])
    const [clientes, setClientes] = useState([])
    const [profissionais, setProfissionais] = useState([])
    const [formulario, setFormulario] = useState(formularioInicial)
    const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null)
    const [modalAberto, setModalAberto] = useState(false)
    const [busca, setBusca] = useState('')
    const [filtroStatus, setFiltroStatus] = useState('TODOS')
    const [ordemCrescente, setOrdemCrescente] = useState(true)
    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)

    const configuracaoApi = useCallback(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    }), [])

    const carregarDados = useCallback(async () => {
        setCarregando(true)
        try {
            const config = configuracaoApi()
            const [resAgendamentos, resClientes, resProfissionais] = await Promise.all([
                axios.get(`${API_URL}/agendamento`, config),
                axios.get(`${API_URL}/cliente`, config),
                axios.get(`${API_URL}/profissional`, config),
            ])
            setAgendamentos(Array.isArray(resAgendamentos.data) ? resAgendamentos.data : [])
            setClientes(Array.isArray(resClientes.data) ? resClientes.data : [])
            setProfissionais(Array.isArray(resProfissionais.data) ? resProfissionais.data : [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível carregar os agendamentos.')
        } finally {
            setCarregando(false)
        }
    }, [configuracaoApi])

    useEffect(() => {
        const carregamentoInicial = window.setTimeout(carregarDados, 0)
        return () => window.clearTimeout(carregamentoInicial)
    }, [carregarDados])

    const registrosVisiveis = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR')
        return agendamentos
            .filter((item) => filtroStatus === 'TODOS' || item.status === filtroStatus)
            .filter((item) => !termo || [
                item.cliente_nome,
                item.profissional_nome,
                item.tipo_faxina,
                item.ambiente,
                item.status,
            ].some((valor) => String(valor || '').toLocaleLowerCase('pt-BR').includes(termo)))
            .sort((a, b) => {
                const primeiro = `${normalizarData(a.data_agendamento)}T${formatarHora(a.hora_inicio)}`
                const segundo = `${normalizarData(b.data_agendamento)}T${formatarHora(b.hora_inicio)}`
                return ordemCrescente ? primeiro.localeCompare(segundo) : segundo.localeCompare(primeiro)
            })
    }, [agendamentos, busca, filtroStatus, ordemCrescente])

    const abrirNovo = () => {
        setAgendamentoEmEdicao(null)
        setFormulario(formularioInicial)
        setModalAberto(true)
    }

    const abrirEdicao = (agendamento) => {
        setAgendamentoEmEdicao(agendamento.id)
        setFormulario({
            cliente_id: agendamento.cliente_id || '',
            profissional_id: agendamento.profissional_id || '',
            data_agendamento: normalizarData(agendamento.data_agendamento),
            hora_inicio: formatarHora(agendamento.hora_inicio),
            hora_fim: formatarHora(agendamento.hora_fim),
            ambiente: agendamento.ambiente || 'RESIDENCIAL',
            tipo_faxina: agendamento.tipo_faxina || 'LEVE',
            status: agendamento.status || 'PENDENTE',
            observacoes: agendamento.observacoes || '',
        })
        setModalAberto(true)
    }

    const alterarCampo = (event) => {
        const { name, value } = event.target
        setFormulario((atual) => ({ ...atual, [name]: value }))
    }

    const salvarAgendamento = async (event) => {
        event.preventDefault()
        if (formulario.hora_fim <= formulario.hora_inicio) {
            toast.error('O horário final deve ser posterior ao horário inicial.')
            return
        }

        setSalvando(true)
        try {
            const url = agendamentoEmEdicao
                ? `${API_URL}/agendamento/${agendamentoEmEdicao}`
                : `${API_URL}/agendamento`
            const requisicao = agendamentoEmEdicao ? axios.put : axios.post
            const { data } = await requisicao(url, formulario, configuracaoApi())
            toast.success(data.message || 'Agendamento salvo com sucesso.')
            setModalAberto(false)
            await carregarDados()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível salvar o agendamento.')
        } finally {
            setSalvando(false)
        }
    }

    const cancelarAgendamento = async (agendamento) => {
        if (!window.confirm(`Deseja cancelar o agendamento de ${agendamento.cliente_nome}?`)) return
        try {
            const { data } = await axios.delete(`${API_URL}/agendamento/${agendamento.id}`, configuracaoApi())
            toast.success(data.message || 'Agendamento cancelado com sucesso.')
            await carregarDados()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível cancelar o agendamento.')
        }
    }

    return (
        <section className="flex-1 overflow-y-auto bg-surface-bright p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">Agendamentos</h2>
                        <p className="mt-1 text-body-md text-on-surface-variant">Gerencie e registre os serviços dos clientes.</p>
                    </div>
                    <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-on-primary transition-opacity hover:opacity-90" onClick={abrirNovo} type="button">
                        <FiPlus aria-hidden="true" /> Novo agendamento
                    </button>
                </header>

                <section className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-soft">
                    <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface px-4 py-4 lg:flex-row lg:items-center">
                        <label className="relative flex-1">
                            <span className="sr-only">Buscar agendamentos</span>
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
                            <input className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-on-surface focus:border-primary focus:outline-none" onChange={(event) => setBusca(event.target.value)} placeholder="Buscar cliente, profissional ou serviço..." type="search" value={busca} />
                        </label>
                        <label className="relative">
                            <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
                            <select className="h-11 rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-8 text-on-surface" onChange={(event) => setFiltroStatus(event.target.value)} value={filtroStatus}>
                                <option value="TODOS">Todos os status</option>
                                {Object.entries(rotulosStatus).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                            </select>
                        </label>
                        <button className="h-11 rounded-lg border border-outline-variant px-4 text-on-surface transition-colors hover:bg-surface-container-high" onClick={() => setOrdemCrescente((atual) => !atual)} type="button">
                            Data: {ordemCrescente ? 'mais próximos' : 'mais distantes'}
                        </button>
                        <button aria-label="Atualizar agendamentos" className="flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high disabled:opacity-50" disabled={carregando} onClick={carregarDados} type="button">
                            <FiRefreshCw className={carregando ? 'animate-spin' : ''} aria-hidden="true" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-225 border-collapse text-left">
                            <thead className="bg-surface-container-low text-label-md uppercase tracking-wider text-on-surface-variant">
                                <tr>
                                    <th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Serviço</th><th className="px-5 py-3">Data e horário</th><th className="px-5 py-3">Profissional</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {carregando && <tr><td className="px-5 py-12 text-center text-on-surface-variant" colSpan="6">Carregando agendamentos...</td></tr>}
                                {!carregando && registrosVisiveis.length === 0 && <tr><td className="px-5 py-12 text-center text-on-surface-variant" colSpan="6">Nenhum agendamento encontrado.</td></tr>}
                                {!carregando && registrosVisiveis.map((item) => (
                                    <tr className="text-body-md text-on-surface transition-colors hover:bg-surface-container-low" key={item.id}>
                                        <td className="px-5 py-4"><span className="flex items-center gap-2 font-semibold"><FiUser aria-hidden="true" />{item.cliente_nome || 'Não informado'}</span></td>
                                        <td className="px-5 py-4 capitalize">{String(item.tipo_faxina || '—').toLocaleLowerCase('pt-BR')}<span className="block text-body-sm text-on-surface-variant">{String(item.ambiente || '').toLocaleLowerCase('pt-BR')}</span></td>
                                        <td className="px-5 py-4"><span className="flex items-center gap-2"><FiCalendar aria-hidden="true" />{formatarData(item.data_agendamento)}</span><span className="block pl-6 text-body-sm text-on-surface-variant">{formatarHora(item.hora_inicio)} – {formatarHora(item.hora_fim)}</span></td>
                                        <td className="px-5 py-4">{item.profissional_nome || 'Não atribuído'}</td>
                                        <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-label-sm ${classesStatus[item.status] || classesStatus.PENDENTE}`}>{rotulosStatus[item.status] || item.status}</span></td>
                                        <td className="px-5 py-4"><div className="flex justify-end gap-2"><button aria-label="Editar agendamento" className="rounded-lg p-2 text-primary hover:bg-primary/10" onClick={() => abrirEdicao(item)} type="button"><FiEdit2 aria-hidden="true" /></button><button aria-label="Cancelar agendamento" className="rounded-lg p-2 text-error hover:bg-error/10 disabled:opacity-40" disabled={item.status === 'CANCELADO'} onClick={() => cancelarAgendamento(item)} type="button"><FiTrash2 aria-hidden="true" /></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <footer className="border-t border-outline-variant px-5 py-3 text-body-sm text-on-surface-variant">{registrosVisiveis.length} {registrosVisiveis.length === 1 ? 'agendamento encontrado' : 'agendamentos encontrados'}</footer>
                </section>
            </div>

            <Modal description="Preencha os dados e verifique o horário disponível." isOpen={modalAberto} onClose={() => setModalAberto(false)} title={agendamentoEmEdicao ? 'Editar agendamento' : 'Novo agendamento'}>
                <form className="grid grid-cols-1 h-155 gap-4 p-6 sm:grid-cols-2" onSubmit={salvarAgendamento}>
                    <CampoSelect label="Cliente" name="cliente_id" onChange={alterarCampo} required value={formulario.cliente_id}>
                        <option value="">Selecione um cliente</option>{clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>)}
                    </CampoSelect>
                    <CampoSelect
                        label="Profissional"
                        name="profissional_id"
                        onChange={alterarCampo}
                        required
                        value={formulario.profissional_id}>

                        <option value="">Selecione um profissional</option>

                        {profissionais.map((profissional) =>

                            <option key={profissional.id} value={profissional.id}>{profissional.nome}</option>)}

                    </CampoSelect>

                    <CampoInput
                        label="Data"
                        min={new Date().toISOString().slice(0, 10)}
                        name="data_agendamento"
                        onChange={alterarCampo}
                        required
                        type="date"
                        value={formulario.data_agendamento}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <CampoInput
                            label="Início"
                            name="hora_inicio"
                            onChange={alterarCampo}
                            required type="time"
                            value={formulario.hora_inicio}
                        />
                        <CampoInput
                            label="Fim"
                            name="hora_fim"
                            onChange={alterarCampo}
                            required type="time"
                            value={formulario.hora_fim}
                        />
                    </div>
                    <CampoSelect
                        label="Ambiente"
                        name="ambiente"
                        onChange={alterarCampo}
                        value={formulario.ambiente}
                    >
                        <option value="RESIDENCIAL">Residencial</option>
                        <option value="COMERCIAL">Comercial</option>
                    </CampoSelect>
                    <CampoSelect
                        label="Tipo de faxina"
                        name="tipo_faxina"
                        onChange={alterarCampo}
                        value={formulario.tipo_faxina}>
                        <option value="LEVE">Leve</option>
                        <option value="MEDIA">Média</option>
                        <option value="PESADA">Pesada</option>
                        <option value="TODOS">Completa</option>
                    </CampoSelect>
                    {agendamentoEmEdicao &&
                        <CampoSelect
                            label="Status"
                            name="status"
                            onChange={alterarCampo}
                            value={formulario.status}>
                            {Object.entries(rotulosStatus).map(([valor, texto]) =>
                                <option
                                    key={valor}
                                    value={valor}>
                                    {texto}
                                </option>)}
                        </CampoSelect>}
                    <label className="space-y-1 sm:col-span-2">
                        <span className="text-label-md text-on-surface-variant">Observações</span>
                        <textarea className="min-h-24 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface focus:border-primary focus:outline-none"
                            name="observacoes"
                            onChange={alterarCampo}
                            placeholder="Detalhes importantes sobre o serviço..."
                            value={formulario.observacoes} />
                    </label>
                    <div className="flex justify-end gap-8 h-20  border-outline-variant pt-5 mt-5 sm:col-span-2">
                        <button className="rounded-lg px-4 py-2 text-primary hover:bg-primary/10"
                            onClick={() => setModalAberto(false)}
                            type="button">Cancelar
                        </button>
                        <button className="rounded-lg  bg-primary px-5 py-2 font-semibold text-on-primary disabled:opacity-60"
                            disabled={salvando}
                            type="submit">{salvando ? 'Salvando...' : 'Salvar agendamento'}</button>
                    </div>
                </form>
            </Modal>
        </section>
    )
}

const CampoInput = ({ label, ...props }) =>
    <label className="space-y-1">
        <span className="text-label-md text-on-surface-variant">{label}</span>
        <input className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-on-surface focus:border-primary focus:outline-none" {...props} />

    </label>
const CampoSelect = ({ children, label, ...props }) =>
    <label className="space-y-1">
        <span className="text-label-md text-on-surface-variant">{label}</span>
        <select className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-on-surface focus:border-primary focus:outline-none" {...props}>{children}</select>
    </label>

export default Agendamentos
