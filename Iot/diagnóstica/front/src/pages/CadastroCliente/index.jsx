import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
    FiCheckCircle,
    FiHome,
    FiMail,
    FiMapPin,
    FiRefreshCw,
    FiSave,
    FiSearch,
    FiUser,
    FiUsers,
    FiX,
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const formularioInicial = {
    nome: '',
    cpf: '',
    email: '',
    cep: '',
    rua: '',
    numero: '',
    tipo: 'LEVE',
}

const somenteNumeros = (valor) => valor.replace(/\D/g, '')
const formatarCpf = (valor) => somenteNumeros(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
const formatarCep = (valor) => somenteNumeros(valor).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
const rotulosFaxina = { LEVE: 'Leve', MEDIA: 'Média', PESADA: 'Pesada', TODOS: 'Completa' }

const CadastroCliente = () => {
    const [formulario, setFormulario] = useState(formularioInicial)
    const [clientes, setClientes] = useState([])
    const [busca, setBusca] = useState('')
    const [salvando, setSalvando] = useState(false)
    const [carregando, setCarregando] = useState(true)
    const [erros, setErros] = useState({})

    const configuracaoApi = useCallback(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    }), [])

    const carregarClientes = useCallback(async () => {
        setCarregando(true)
        try {
            const { data } = await axios.get(`${API_URL}/cliente`, configuracaoApi())
            setClientes(Array.isArray(data) ? data : [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível carregar os clientes.')
        } finally {
            setCarregando(false)
        }
    }, [configuracaoApi])

    useEffect(() => {
        const carregamentoInicial = window.setTimeout(carregarClientes, 0)
        return () => window.clearTimeout(carregamentoInicial)
    }, [carregarClientes])

    const clientesFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR')
        if (!termo) return clientes
        return clientes.filter((cliente) => [cliente.nome, cliente.email, cliente.rua, cliente.tipo]
            .some((valor) => String(valor || '').toLocaleLowerCase('pt-BR').includes(termo)))
    }, [busca, clientes])

    const alterarCampo = (event) => {
        const { name } = event.target
        let { value } = event.target
        if (name === 'cpf') value = formatarCpf(value)
        if (name === 'cep') value = formatarCep(value)
        setFormulario((atual) => ({ ...atual, [name]: value }))
        setErros((atuais) => ({ ...atuais, [name]: '' }))
    }

    const validar = () => {
        const novosErros = {}
        if (formulario.nome.trim().length < 3) novosErros.nome = 'Informe um nome com pelo menos 3 caracteres.'
        if (somenteNumeros(formulario.cpf).length !== 11) novosErros.cpf = 'Informe um CPF com 11 números.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) novosErros.email = 'Informe um e-mail válido.'
        if (somenteNumeros(formulario.cep).length !== 8) novosErros.cep = 'Informe um CEP com 8 números.'
        if (!formulario.rua.trim()) novosErros.rua = 'Informe o endereço do cliente.'
        if (!formulario.numero.trim()) novosErros.numero = 'Informe o número.'
        setErros(novosErros)
        return Object.keys(novosErros).length === 0
    }

    const limparFormulario = () => {
        setFormulario(formularioInicial)
        setErros({})
    }

    const cadastrarCliente = async (event) => {
        event.preventDefault()
        if (!validar() || salvando) return

        setSalvando(true)
        try {
            const payload = {
                ...formulario,
                nome: formulario.nome.trim(),
                cpf: somenteNumeros(formulario.cpf),
                email: formulario.email.trim().toLocaleLowerCase('pt-BR'),
                cep: somenteNumeros(formulario.cep),
                rua: formulario.rua.trim(),
                numero: formulario.numero.trim(),
            }
            const { data } = await axios.post(`${API_URL}/cliente/cadastro`, payload, configuracaoApi())
            toast.success(data.message || 'Cliente cadastrado com sucesso.')
            limparFormulario()
            await carregarClientes()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível cadastrar o cliente.')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <section className="flex-1 overflow-y-auto bg-surface-bright p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <header>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Cadastro de clientes</h2>
                    <p className="mt-1 text-body-md text-on-surface-variant">Registre os dados do cliente e o endereço onde o serviço será realizado.</p>
                </header>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <form className="space-y-6" noValidate onSubmit={cadastrarCliente}>
                        <Cartao titulo="Dados pessoais" Icone={FiUser}>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Campo erro={erros.nome} id="nome" label="Nome completo" name="nome" onChange={alterarCampo} placeholder="Nome do cliente" required value={formulario.nome} />
                                <Campo erro={erros.cpf} id="cpf" inputMode="numeric" label="CPF" maxLength="14" name="cpf" onChange={alterarCampo} placeholder="000.000.000-00" required value={formulario.cpf} />
                                <Campo className="md:col-span-2" erro={erros.email} Icone={FiMail} id="email" label="E-mail" name="email" onChange={alterarCampo} placeholder="cliente@exemplo.com" required type="email" value={formulario.email} />
                            </div>
                        </Cartao>

                        <Cartao titulo="Endereço do serviço" Icone={FiHome}>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                                <Campo className="md:col-span-4" erro={erros.cep} id="cep" inputMode="numeric" label="CEP" maxLength="9" name="cep" onChange={alterarCampo} placeholder="00000-000" required value={formulario.cep} />
                                <Campo className="md:col-span-6" erro={erros.rua} id="rua" label="Rua ou avenida" name="rua" onChange={alterarCampo} placeholder="Informe o logradouro" required value={formulario.rua} />
                                <Campo className="md:col-span-2" erro={erros.numero} id="numero" label="Número" name="numero" onChange={alterarCampo} placeholder="123" required value={formulario.numero} />
                                <label className="space-y-2 md:col-span-12" htmlFor="tipo">
                                    <span className="font-label-md text-label-md text-on-surface">Preferência de faxina</span>
                                    <select className="h-12 w-full rounded-lg border border-outline-variant bg-surface px-4 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" id="tipo" name="tipo" onChange={alterarCampo} value={formulario.tipo}>
                                        {Object.entries(rotulosFaxina).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                                    </select>
                                    <span className="block text-body-sm text-on-surface-variant">Define o tipo de serviço mais solicitado por este cliente.</span>
                                </label>
                            </div>
                        </Cartao>

                        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-outline-variant px-5 text-on-surface transition-colors hover:bg-surface-container-high" onClick={limparFormulario} type="button"><FiX aria-hidden="true" /> Limpar</button>
                            <button className="inline-flex h-12 min-w-48 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60" disabled={salvando} type="submit">{salvando ? <FiRefreshCw className="animate-spin" aria-hidden="true" /> : <FiSave aria-hidden="true" />}{salvando ? 'Salvando...' : 'Salvar cliente'}</button>
                        </div>
                    </form>

                    <aside className="h-fit overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-soft xl:sticky xl:top-22">
                        <div className="border-b border-outline-variant bg-surface p-5">
                            <div className="flex items-center justify-between gap-3"><div><h3 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface"><FiUsers className="text-primary" aria-hidden="true" />Clientes cadastrados</h3><p className="mt-1 text-body-sm text-on-surface-variant">{clientes.length} {clientes.length === 1 ? 'registro' : 'registros'} no banco</p></div><button aria-label="Atualizar clientes" className="rounded-lg p-2 text-primary hover:bg-primary/10 disabled:opacity-50" disabled={carregando} onClick={carregarClientes} type="button"><FiRefreshCw className={carregando ? 'animate-spin' : ''} aria-hidden="true" /></button></div>
                            <label className="relative mt-4 block"><span className="sr-only">Buscar cliente cadastrado</span><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" /><input className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-on-surface focus:border-primary focus:outline-none" onChange={(event) => setBusca(event.target.value)} placeholder="Buscar cliente..." type="search" value={busca} /></label>
                        </div>
                        <div className="max-h-145 divide-y divide-outline-variant overflow-y-auto">
                            {carregando && <p className="p-8 text-center text-on-surface-variant">Carregando clientes...</p>}
                            {!carregando && clientesFiltrados.length === 0 && <p className="p-8 text-center text-on-surface-variant">Nenhum cliente encontrado.</p>}
                            {!carregando && clientesFiltrados.map((cliente) => <article className="p-4 transition-colors hover:bg-surface-container-low" key={cliente.id}><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><FiUser aria-hidden="true" /></span><div className="min-w-0"><h4 className="truncate font-semibold text-on-surface">{cliente.nome}</h4><p className="truncate text-body-sm text-on-surface-variant">{cliente.email}</p><p className="mt-1 flex items-center gap-1 text-body-sm text-on-surface-variant"><FiMapPin className="shrink-0" aria-hidden="true" />{[cliente.rua, cliente.numero].filter(Boolean).join(', ') || 'Endereço não informado'}</p><span className="mt-2 inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-label-sm text-secondary"><FiCheckCircle aria-hidden="true" />Faxina {rotulosFaxina[cliente.tipo] || cliente.tipo}</span></div></div></article>)}
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    )
}

const Cartao = ({ children, Icone, titulo }) => <section className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-soft md:p-6"><h3 className="mb-5 flex items-center gap-2 font-headline-md text-headline-md text-on-surface"><Icone className="text-primary" aria-hidden="true" />{titulo}</h3>{children}</section>

const Campo = ({ className = '', erro, Icone, id, label, ...props }) => <label className={`space-y-2 ${className}`} htmlFor={id}><span className="font-label-md text-label-md text-on-surface">{label}{props.required && <span className="text-error"> *</span>}</span><span className="relative block">{Icone && <Icone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />}<input aria-describedby={erro ? `${id}-erro` : undefined} aria-invalid={Boolean(erro)} className={`h-12 w-full rounded-lg border bg-surface px-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 ${Icone ? 'pl-10' : ''} ${erro ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`} id={id} {...props} /></span>{erro && <span className="block text-body-sm text-error" id={`${id}-erro`}>{erro}</span>}</label>

export default CadastroCliente
