import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
    FiBriefcase,
    FiCalendar,
    FiCheckCircle,
    FiEye,
    FiEyeOff,
    FiLock,
    FiMail,
    FiPlus,
    FiRefreshCw,
    FiSave,
    FiSearch,
    FiShield,
    FiUser,
    FiUsers,
    FiTrash2,
    FiX,
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const formularioInicial = {
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'TODOS',
}

const novaDisponibilidade = () => ({
    id: `${Date.now()}-${Math.random()}`,
    data_disponivel: '',
    hora_inicio: '08:00',
    hora_fim: '17:00',
    disponivel: true,
})

const rotulosFaxina = { LEVE: 'Leve', MEDIA: 'Média', PESADA: 'Pesada', TODOS: 'Todos os tipos' }
const somenteNumeros = (valor) => valor.replace(/\D/g, '')
const formatarCpf = (valor) => somenteNumeros(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const CadastroProfissional = () => {
    const [formulario, setFormulario] = useState(formularioInicial)
    const [profissionais, setProfissionais] = useState([])
    const [busca, setBusca] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [carregando, setCarregando] = useState(true)
    const [erros, setErros] = useState({})
    const [disponibilidades, setDisponibilidades] = useState([novaDisponibilidade()])

    const configuracaoApi = useCallback(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    }), [])

    const carregarProfissionais = useCallback(async () => {
        setCarregando(true)
        try {
            const { data } = await axios.get(`${API_URL}/profissional`, configuracaoApi())
            setProfissionais(Array.isArray(data) ? data : [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível carregar os profissionais.')
        } finally {
            setCarregando(false)
        }
    }, [configuracaoApi])

    useEffect(() => {
        const carregamentoInicial = window.setTimeout(carregarProfissionais, 0)
        return () => window.clearTimeout(carregamentoInicial)
    }, [carregarProfissionais])

    const profissionaisFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR')
        if (!termo) return profissionais
        return profissionais.filter((profissional) => [
            profissional.nome,
            profissional.email,
            profissional.cpf,
            profissional.tipo,
            rotulosFaxina[profissional.tipo],
        ].some((valor) => String(valor || '').toLocaleLowerCase('pt-BR').includes(termo)))
    }, [busca, profissionais])

    const alterarCampo = (event) => {
        const { name } = event.target
        const value = name === 'cpf' ? formatarCpf(event.target.value) : event.target.value
        setFormulario((atual) => ({ ...atual, [name]: value }))
        setErros((atuais) => ({ ...atuais, [name]: '' }))
    }

    const validar = () => {
        const novosErros = {}
        if (formulario.nome.trim().length < 3) novosErros.nome = 'Informe um nome com pelo menos 3 caracteres.'
        if (somenteNumeros(formulario.cpf).length !== 11) novosErros.cpf = 'Informe um CPF com 11 números.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) novosErros.email = 'Informe um e-mail válido.'
        if (formulario.senha.length < 8) novosErros.senha = 'A senha deve possuir pelo menos 8 caracteres.'
        if (formulario.confirmarSenha !== formulario.senha) novosErros.confirmarSenha = 'As senhas não são iguais.'
        const hoje = new Date().toISOString().slice(0, 10)
        if (disponibilidades.length === 0) novosErros.disponibilidades = 'Adicione pelo menos um período de disponibilidade.'
        if (disponibilidades.some((periodo) => !periodo.data_disponivel || periodo.data_disponivel < hoje)) novosErros.disponibilidades = 'Informe datas atuais ou futuras em todos os períodos.'
        if (disponibilidades.some((periodo) => !periodo.hora_inicio || !periodo.hora_fim || periodo.hora_fim <= periodo.hora_inicio)) novosErros.disponibilidades = 'O horário final deve ser posterior ao horário inicial.'
        setErros(novosErros)
        return Object.keys(novosErros).length === 0
    }

    const limparFormulario = () => {
        setFormulario(formularioInicial)
        setErros({})
        setMostrarSenha(false)
        setDisponibilidades([novaDisponibilidade()])
    }

    const alterarDisponibilidade = (id, campo, valor) => {
        setDisponibilidades((atuais) => atuais.map((periodo) => periodo.id === id
            ? { ...periodo, [campo]: valor }
            : periodo))
        setErros((atuais) => ({ ...atuais, disponibilidades: '' }))
    }

    const adicionarDisponibilidade = () => {
        setDisponibilidades((atuais) => [...atuais, novaDisponibilidade()])
    }

    const removerDisponibilidade = (id) => {
        setDisponibilidades((atuais) => atuais.filter((periodo) => periodo.id !== id))
    }

    const cadastrarProfissional = async (event) => {
        event.preventDefault()
        if (!validar() || salvando) return

        setSalvando(true)
        try {
            const payload = {
                nome: formulario.nome.trim(),
                cpf: somenteNumeros(formulario.cpf),
                email: formulario.email.trim().toLocaleLowerCase('pt-BR'),
                senha: formulario.senha,
                tipo: formulario.tipo,
                disponibilidades: disponibilidades.map((periodo) => ({
                    data_disponivel: periodo.data_disponivel,
                    hora_inicio: periodo.hora_inicio,
                    hora_fim: periodo.hora_fim,
                    disponivel: periodo.disponivel,
                })),
            }
            const { data } = await axios.post(`${API_URL}/profissional/cadastro`, payload, configuracaoApi())
            toast.success(data.message || 'Profissional cadastrado com sucesso.')
            limparFormulario()
            await carregarProfissionais()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível cadastrar o profissional.')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <section className="flex-1 overflow-y-auto bg-surface-bright p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <header>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Cadastro de profissionais</h2>
                    <p className="mt-1 text-body-md text-on-surface-variant">Registre os dados de acesso e a especialidade de cada profissional.</p>
                </header>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <form className="space-y-6" noValidate onSubmit={cadastrarProfissional}>
                        <Cartao Icone={FiUser} titulo="Dados pessoais">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Campo erro={erros.nome} id="nome" label="Nome completo" name="nome" onChange={alterarCampo} placeholder="Nome do profissional" required value={formulario.nome} />
                                <Campo erro={erros.cpf} id="cpf" inputMode="numeric" label="CPF" maxLength="14" name="cpf" onChange={alterarCampo} placeholder="000.000.000-00" required value={formulario.cpf} />
                                <Campo className="md:col-span-2" erro={erros.email} Icone={FiMail} id="email" label="E-mail" name="email" onChange={alterarCampo} placeholder="profissional@exemplo.com" required type="email" value={formulario.email} />
                            </div>
                        </Cartao>

                        <Cartao Icone={FiCalendar} titulo="Disponibilidade inicial">
                            <div className="space-y-4">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                    <p className="text-body-sm text-on-surface-variant">Adicione os dias e horários nos quais o profissional poderá receber agendamentos.</p>
                                    <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-label-md text-primary transition-colors hover:bg-primary/10" onClick={adicionarDisponibilidade} type="button"><FiPlus aria-hidden="true" />Adicionar período</button>
                                </div>
                                {disponibilidades.map((periodo, indice) => (
                                    <div className="grid grid-cols-1 gap-3 rounded-xl border border-outline-variant bg-surface p-4 sm:grid-cols-[minmax(160px,1fr)_1fr_1fr_auto] sm:items-end" key={periodo.id}>
                                        <CampoDisponibilidade label={`Data ${indice + 1}`} min={new Date().toISOString().slice(0, 10)} onChange={(event) => alterarDisponibilidade(periodo.id, 'data_disponivel', event.target.value)} type="date" value={periodo.data_disponivel} />
                                        <CampoDisponibilidade label="Início" onChange={(event) => alterarDisponibilidade(periodo.id, 'hora_inicio', event.target.value)} type="time" value={periodo.hora_inicio} />
                                        <CampoDisponibilidade label="Fim" onChange={(event) => alterarDisponibilidade(periodo.id, 'hora_fim', event.target.value)} type="time" value={periodo.hora_fim} />
                                        <button aria-label={`Remover período ${indice + 1}`} className="flex h-12 w-12 items-center justify-center rounded-lg text-error transition-colors hover:bg-error/10 disabled:opacity-40" disabled={disponibilidades.length === 1} onClick={() => removerDisponibilidade(periodo.id)} type="button"><FiTrash2 aria-hidden="true" /></button>
                                    </div>
                                ))}
                                {erros.disponibilidades && <p className="text-body-sm text-error">{erros.disponibilidades}</p>}
                            </div>
                        </Cartao>

                        <Cartao Icone={FiShield} titulo="Acesso e especialidade">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <CampoSenha erro={erros.senha} id="senha" label="Senha" mostrar={mostrarSenha} name="senha" onChange={alterarCampo} placeholder="Mínimo de 8 caracteres" value={formulario.senha} />
                                <CampoSenha erro={erros.confirmarSenha} id="confirmarSenha" label="Confirmar senha" mostrar={mostrarSenha} name="confirmarSenha" onChange={alterarCampo} placeholder="Digite a senha novamente" value={formulario.confirmarSenha} />
                                <label className="space-y-2 md:col-span-2" htmlFor="tipo">
                                    <span className="font-label-md text-label-md text-on-surface">Especialidade de faxina</span>
                                    <select className="h-12 w-full rounded-lg border border-outline-variant bg-surface px-4 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" id="tipo" name="tipo" onChange={alterarCampo} value={formulario.tipo}>
                                        {Object.entries(rotulosFaxina).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                                    </select>
                                    <span className="block text-body-sm text-on-surface-variant">A especialidade ajuda a escolher o profissional adequado para cada agendamento.</span>
                                </label>
                                <label className="flex items-center gap-2 text-body-sm text-on-surface-variant md:col-span-2"><input checked={mostrarSenha} className="h-4 w-4 accent-primary" onChange={(event) => setMostrarSenha(event.target.checked)} type="checkbox" />Mostrar senhas</label>
                            </div>
                        </Cartao>

                        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant px-5 text-on-surface transition-colors hover:bg-surface-container-high" onClick={limparFormulario} type="button"><FiX aria-hidden="true" /> Limpar</button>
                            <button className="inline-flex h-12 min-w-56 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60" disabled={salvando} type="submit">{salvando ? <FiRefreshCw className="animate-spin" aria-hidden="true" /> : <FiSave aria-hidden="true" />}{salvando ? 'Salvando...' : 'Salvar profissional'}</button>
                        </div>
                    </form>

                    <aside className="h-fit overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-soft xl:sticky xl:top-22">
                        <div className="border-b border-outline-variant bg-surface p-5">
                            <div className="flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface"><FiUsers className="text-primary" aria-hidden="true" />Profissionais</h3><p className="mt-1 text-body-sm text-on-surface-variant">{profissionais.length} {profissionais.length === 1 ? 'registro' : 'registros'} no banco</p></div><button aria-label="Atualizar profissionais" className="rounded-lg p-2 text-primary hover:bg-primary/10 disabled:opacity-50" disabled={carregando} onClick={carregarProfissionais} type="button"><FiRefreshCw className={carregando ? 'animate-spin' : ''} aria-hidden="true" /></button></div>
                            <label className="relative mt-4 block"><span className="sr-only">Buscar profissional cadastrado</span><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" /><input className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-on-surface focus:border-primary focus:outline-none" onChange={(event) => setBusca(event.target.value)} placeholder="Buscar profissional..." type="search" value={busca} /></label>
                        </div>
                        <div className="max-h-145 divide-y divide-outline-variant overflow-y-auto">
                            {carregando && <p className="p-8 text-center text-on-surface-variant">Carregando profissionais...</p>}
                            {!carregando && profissionaisFiltrados.length === 0 && <p className="p-8 text-center text-on-surface-variant">Nenhum profissional encontrado.</p>}
                            {!carregando && profissionaisFiltrados.map((profissional) => <article className="p-4 transition-colors hover:bg-surface-container-low" key={profissional.id}><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><FiBriefcase aria-hidden="true" /></span><div className="min-w-0"><h4 className="truncate font-semibold text-on-surface">{profissional.nome}</h4><p className="truncate text-body-sm text-on-surface-variant">{profissional.email}</p><p className="mt-1 text-body-sm text-on-surface-variant">CPF: {profissional.cpf ? formatarCpf(profissional.cpf) : 'Não informado'}</p><span className="mt-2 inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-label-sm text-secondary"><FiCheckCircle aria-hidden="true" />{rotulosFaxina[profissional.tipo] || profissional.tipo}</span></div></div></article>)}
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    )
}

const Cartao = ({ children, Icone, titulo }) => <section className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-soft md:p-6"><h3 className="mb-5 flex items-center gap-2 font-headline-md text-headline-md text-on-surface"><Icone className="text-primary" aria-hidden="true" />{titulo}</h3>{children}</section>

const Campo = ({ className = '', erro, Icone, id, label, ...props }) => <label className={`space-y-2 ${className}`} htmlFor={id}><span className="font-label-md text-label-md text-on-surface">{label}{props.required && <span className="text-error"> *</span>}</span><span className="relative block">{Icone && <Icone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />}<input aria-describedby={erro ? `${id}-erro` : undefined} aria-invalid={Boolean(erro)} className={`h-12 w-full rounded-lg border bg-surface px-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 ${Icone ? 'pl-10' : ''} ${erro ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`} id={id} {...props} /></span>{erro && <span className="block text-body-sm text-error" id={`${id}-erro`}>{erro}</span>}</label>

const CampoSenha = ({ erro, id, label, mostrar, ...props }) => <label className="space-y-2" htmlFor={id}><span className="font-label-md text-label-md text-on-surface">{label}<span className="text-error"> *</span></span><span className="relative block"><FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" /><input aria-describedby={erro ? `${id}-erro` : undefined} aria-invalid={Boolean(erro)} className={`h-12 w-full rounded-lg border bg-surface pl-10 pr-10 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 ${erro ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`} id={id} required type={mostrar ? 'text' : 'password'} {...props} />{mostrar ? <FiEye className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" /> : <FiEyeOff className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />}</span>{erro && <span className="block text-body-sm text-error" id={`${id}-erro`}>{erro}</span>}</label>

const CampoDisponibilidade = ({ label, ...props }) => <label className="space-y-2"><span className="font-label-md text-label-md text-on-surface">{label}<span className="text-error"> *</span></span><input className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required {...props} /></label>

export default CadastroProfissional
