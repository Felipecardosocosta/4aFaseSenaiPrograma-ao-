import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
    FiAlertTriangle,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiEdit2,
    FiPlus,
    FiRefreshCw,
    FiSave,
    FiSearch,
    FiUser,
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const formularioInicial = {
    cliente_id: '', profissional_id: '', data_agendamento: '', hora_inicio: '', hora_fim: '',
    ambiente: 'RESIDENCIAL', tipo_faxina: 'LEVE', status: 'PENDENTE', observacoes: '',
}
const rotulosStatus = { PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado' }
const classesStatus = {
    PENDENTE: 'border-tertiary/30 bg-tertiary/10 text-tertiary',
    CONFIRMADO: 'border-primary/30 bg-primary/10 text-primary',
    CONCLUIDO: 'border-secondary/30 bg-secondary/10 text-secondary',
    CANCELADO: 'border-error/30 bg-error/10 text-error',
}
const dataIso = (data) => data ? String(data).slice(0, 10) : ''
const horaCurta = (hora) => hora ? String(hora).slice(0, 5) : '—'
const dataBr = (data) => data ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${dataIso(data)}T00:00:00Z`)) : '—'

// Insertion Sort: adequado à lista administrativa e mantém o critério explícito exigido.
const ordenarAgendamentos = (itens, criterio, crescente) => {
    const ordenados = [...itens]
    const chave = (item) => criterio === 'cliente'
        ? String(item.cliente_nome || '').toLocaleLowerCase('pt-BR')
        : `${dataIso(item.data_agendamento)}T${horaCurta(item.hora_inicio)}`

    for (let atual = 1; atual < ordenados.length; atual += 1) {
        const item = ordenados[atual]
        let anterior = atual - 1
        while (anterior >= 0 && (crescente ? chave(ordenados[anterior]) > chave(item) : chave(ordenados[anterior]) < chave(item))) {
            ordenados[anterior + 1] = ordenados[anterior]
            anterior -= 1
        }
        ordenados[anterior + 1] = item
    }
    return ordenados
}

const GestaoAgendamentos = () => {
    const [agendamentos, setAgendamentos] = useState([])
    const [clientes, setClientes] = useState([])
    const [profissionais, setProfissionais] = useState([])
    const [selecionado, setSelecionado] = useState(null)
    const [formulario, setFormulario] = useState(formularioInicial)
    const [busca, setBusca] = useState('')
    const [criterio, setCriterio] = useState('data')
    const [crescente, setCrescente] = useState(true)
    const [carregando, setCarregando] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [verificacao, setVerificacao] = useState({ estado: 'inicial', mensagem: 'Preencha profissional, data e horários.' })

    const api = useCallback(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } }), [])
    const carregarDados = useCallback(async () => {
        setCarregando(true)
        try {
            const config = api()
            const [agenda, listaClientes, listaProfissionais] = await Promise.all([
                axios.get(`${API_URL}/agendamento`, config),
                axios.get(`${API_URL}/cliente`, config),
                axios.get(`${API_URL}/profissional`, config),
            ])
            setAgendamentos(Array.isArray(agenda.data) ? agenda.data : [])
            setClientes(Array.isArray(listaClientes.data) ? listaClientes.data : [])
            setProfissionais(Array.isArray(listaProfissionais.data) ? listaProfissionais.data : [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível carregar a gestão de agendamentos.')
        } finally {
            setCarregando(false)
        }
    }, [api])

    useEffect(() => {
        const inicio = window.setTimeout(carregarDados, 0)
        return () => window.clearTimeout(inicio)
    }, [carregarDados])

    const camposVerificaveis = Boolean(formulario.cliente_id && formulario.profissional_id && formulario.data_agendamento && formulario.hora_inicio && formulario.hora_fim)
    useEffect(() => {
        if (!camposVerificaveis) return undefined
        const controller = new AbortController()
        const temporizador = window.setTimeout(async () => {
            setVerificacao({ estado: 'verificando', mensagem: 'Verificando disponibilidade e conflitos...' })
            try {
                const { data } = await axios.post(`${API_URL}/agendamento/verificar-disponibilidade`, {
                    ...formulario,
                    ignorar_agendamento_id: selecionado,
                }, { ...api(), signal: controller.signal })
                setVerificacao({ estado: 'disponivel', mensagem: data.message || 'Horário disponível.' })
            } catch (error) {
                if (error.code === 'ERR_CANCELED') return
                setVerificacao({ estado: 'conflito', mensagem: error.response?.data?.message || 'Conflito ou indisponibilidade detectada.' })
            }
        }, 450)
        return () => {
            window.clearTimeout(temporizador)
            controller.abort()
        }
    }, [api, camposVerificaveis, formulario, selecionado])

    const listaVisivel = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR')
        const filtrados = agendamentos.filter((item) => !termo || [item.cliente_nome, item.profissional_nome, item.ambiente, item.tipo_faxina, item.status]
            .some((valor) => String(valor || '').toLocaleLowerCase('pt-BR').includes(termo)))
        return ordenarAgendamentos(filtrados, criterio, crescente)
    }, [agendamentos, busca, crescente, criterio])

    const selecionar = (item) => {
        setSelecionado(item.id)
        setFormulario({
            cliente_id: item.cliente_id || '', profissional_id: item.profissional_id || '',
            data_agendamento: dataIso(item.data_agendamento), hora_inicio: horaCurta(item.hora_inicio),
            hora_fim: horaCurta(item.hora_fim), ambiente: item.ambiente || 'RESIDENCIAL',
            tipo_faxina: item.tipo_faxina || 'LEVE', status: item.status || 'PENDENTE', observacoes: item.observacoes || '',
        })
    }
    const novo = () => {
        setSelecionado(null)
        setFormulario(formularioInicial)
        setVerificacao({ estado: 'inicial', mensagem: 'Preencha profissional, data e horários.' })
    }
    const alterarCampo = (event) => {
        const atualizado = { ...formulario, [event.target.name]: event.target.value }
        setFormulario(atualizado)
        const pronto = atualizado.cliente_id && atualizado.profissional_id && atualizado.data_agendamento && atualizado.hora_inicio && atualizado.hora_fim
        setVerificacao(pronto
            ? { estado: 'verificando', mensagem: 'Aguardando verificação automática...' }
            : { estado: 'inicial', mensagem: 'Preencha profissional, data e horários.' })
    }
    const salvar = async (event) => {
        event.preventDefault()
        if (verificacao.estado !== 'disponivel') {
            toast.error(verificacao.mensagem || 'Verifique a disponibilidade antes de salvar.')
            return
        }
        setSalvando(true)
        try {
            const url = selecionado ? `${API_URL}/agendamento/${selecionado}` : `${API_URL}/agendamento`
            const requisicao = selecionado ? axios.put : axios.post
            const { data } = await requisicao(url, formulario, api())
            toast.success(data.message || 'Agendamento salvo com sucesso.')
            novo()
            await carregarDados()
        } catch (error) {
            const mensagem = error.response?.data?.message || 'Não foi possível salvar o agendamento.'
            setVerificacao({ estado: 'conflito', mensagem })
            toast.error(mensagem)
        } finally {
            setSalvando(false)
        }
    }

    return (
        <section className="flex-1 overflow-y-auto bg-surface-bright p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="font-headline-lg text-headline-lg text-on-surface">Gestão de agendamentos</h2><p className="mt-1 text-body-md text-on-surface-variant">Selecione, movimente ou crie agendamentos com verificação automática de horários.</p></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary" onClick={novo} type="button"><FiPlus aria-hidden="true" />Novo agendamento</button></header>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,1fr)]">
                    <section className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-soft">
                        <div className="grid gap-3 border-b border-outline-variant bg-surface p-4 md:grid-cols-[1fr_auto_auto_auto]"><label className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" /><input className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-on-surface" onChange={(e) => setBusca(e.target.value)} placeholder="Buscar agendamento..." type="search" value={busca} /></label><select className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-on-surface" onChange={(e) => setCriterio(e.target.value)} value={criterio}><option value="data">Ordem cronológica</option><option value="cliente">Ordem alfabética</option></select><button className="h-10 rounded-lg border border-outline-variant px-3 text-on-surface" onClick={() => setCrescente((valor) => !valor)} type="button">{crescente ? 'Crescente' : 'Decrescente'}</button><button aria-label="Atualizar" className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant" onClick={carregarDados} type="button"><FiRefreshCw className={carregando ? 'animate-spin' : ''} aria-hidden="true" /></button></div>
                        <div className="max-h-[68vh] divide-y divide-outline-variant overflow-y-auto">{carregando && <p className="p-10 text-center text-on-surface-variant">Carregando agendamentos...</p>}{!carregando && listaVisivel.length === 0 && <p className="p-10 text-center text-on-surface-variant">Nenhum agendamento encontrado.</p>}{!carregando && listaVisivel.map((item) => <button className={`grid w-full gap-3 p-4 text-left transition-colors sm:grid-cols-[1.2fr_1fr_auto] ${selecionado === item.id ? 'bg-primary/10 ring-1 ring-inset ring-primary' : 'hover:bg-surface-container-low'}`} key={item.id} onClick={() => selecionar(item)} type="button"><span><strong className="flex items-center gap-2 text-on-surface"><FiUser aria-hidden="true" />{item.cliente_nome}</strong><small className="mt-1 block capitalize text-on-surface-variant">{String(item.ambiente).toLocaleLowerCase('pt-BR')} · {String(item.tipo_faxina).toLocaleLowerCase('pt-BR')}</small></span><span className="text-body-sm text-on-surface-variant"><span className="flex items-center gap-1"><FiCalendar aria-hidden="true" />{dataBr(item.data_agendamento)}</span><span className="mt-1 flex items-center gap-1"><FiClock aria-hidden="true" />{horaCurta(item.hora_inicio)} – {horaCurta(item.hora_fim)}</span></span><span className={`h-fit rounded-full border px-2.5 py-1 text-label-sm ${classesStatus[item.status] || classesStatus.PENDENTE}`}>{rotulosStatus[item.status] || item.status}</span></button>)}</div>
                    </section>

                    <form className="h-fit space-y-5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-soft xl:sticky xl:top-22" onSubmit={salvar}>
                        <div className="flex items-center justify-between"><div><h3 className="font-headline-md text-headline-md text-on-surface">{selecionado ? 'Movimentar agendamento' : 'Novo agendamento'}</h3><p className="text-body-sm text-on-surface-variant">{selecionado ? 'Altere a marcação selecionada.' : 'Crie uma nova marcação.'}</p></div>{selecionado && <FiEdit2 className="text-primary" aria-hidden="true" />}</div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><CampoSelect label="Cliente" name="cliente_id" onChange={alterarCampo} required value={formulario.cliente_id}><option value="">Selecione</option>{clientes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</CampoSelect><CampoSelect label="Profissional" name="profissional_id" onChange={alterarCampo} required value={formulario.profissional_id}><option value="">Selecione</option>{profissionais.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</CampoSelect><CampoSelect label="Ambiente" name="ambiente" onChange={alterarCampo} value={formulario.ambiente}><option value="RESIDENCIAL">Residencial</option><option value="COMERCIAL">Comercial</option></CampoSelect><CampoSelect label="Tipo de faxina" name="tipo_faxina" onChange={alterarCampo} value={formulario.tipo_faxina}><option value="LEVE">Leve</option><option value="MEDIA">Média</option><option value="PESADA">Pesada</option><option value="TODOS">Completa</option></CampoSelect><CampoInput label="Data" min={new Date().toISOString().slice(0, 10)} name="data_agendamento" onChange={alterarCampo} required type="date" value={formulario.data_agendamento} /><div className="grid grid-cols-2 gap-2"><CampoInput label="Início" name="hora_inicio" onChange={alterarCampo} required type="time" value={formulario.hora_inicio} /><CampoInput label="Fim" name="hora_fim" onChange={alterarCampo} required type="time" value={formulario.hora_fim} /></div><CampoSelect label="Status" name="status" onChange={alterarCampo} value={formulario.status}>{Object.entries(rotulosStatus).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}</CampoSelect></div>
                        <label className="block space-y-1"><span className="text-label-md text-on-surface-variant">Observações</span><textarea className="min-h-20 w-full rounded-lg border border-outline-variant bg-surface p-3 text-on-surface" name="observacoes" onChange={alterarCampo} value={formulario.observacoes} /></label>
                        <div className={`flex items-start gap-2 rounded-lg border p-3 text-body-sm ${verificacao.estado === 'disponivel' ? 'border-secondary/30 bg-secondary/10 text-secondary' : verificacao.estado === 'conflito' ? 'border-error/30 bg-error/10 text-error' : 'border-outline-variant bg-surface text-on-surface-variant'}`}>{verificacao.estado === 'disponivel' ? <FiCheckCircle className="mt-0.5 shrink-0" aria-hidden="true" /> : verificacao.estado === 'verificando' ? <FiRefreshCw className="mt-0.5 shrink-0 animate-spin" aria-hidden="true" /> : <FiAlertTriangle className="mt-0.5 shrink-0" aria-hidden="true" />}<span>{verificacao.mensagem}</span></div>
                        <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-on-primary disabled:opacity-50" disabled={salvando || verificacao.estado !== 'disponivel'} type="submit"><FiSave aria-hidden="true" />{salvando ? 'Salvando...' : selecionado ? 'Salvar movimentação' : 'Cadastrar agendamento'}</button>
                    </form>
                </div>
            </div>
        </section>
    )
}

const CampoInput = ({ label, ...props }) => <label className="space-y-1"><span className="text-label-md text-on-surface-variant">{label}</span><input className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-on-surface focus:border-primary focus:outline-none" {...props} /></label>
const CampoSelect = ({ children, label, ...props }) => <label className="space-y-1"><span className="text-label-md text-on-surface-variant">{label}</span><select className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-on-surface focus:border-primary focus:outline-none" {...props}>{children}</select></label>

export default GestaoAgendamentos
