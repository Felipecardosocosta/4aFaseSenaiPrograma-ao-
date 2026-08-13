import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail, FiSave, FiShield, FiUser } from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const inicial = { nome: '', cpf: '', email: '', senha: '', confirmarSenha: '' }
const numeros = (valor) => valor.replace(/\D/g, '')
const mascaraCpf = (valor) => numeros(valor).slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const CadastroUsuario = () => {
    const navigate = useNavigate()
    const [formulario, setFormulario] = useState(inicial)
    const [erros, setErros] = useState({})
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [salvando, setSalvando] = useState(false)

    const alterar = (event) => {
        const { name } = event.target
        const value = name === 'cpf' ? mascaraCpf(event.target.value) : event.target.value
        setFormulario((atual) => ({ ...atual, [name]: value }))
        setErros((atuais) => ({ ...atuais, [name]: '' }))
    }
    const validar = () => {
        const novos = {}
        if (formulario.nome.trim().length < 3) novos.nome = 'Informe seu nome completo.'
        if (numeros(formulario.cpf).length !== 11) novos.cpf = 'Informe um CPF com 11 números.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) novos.email = 'Informe um e-mail válido.'
        if (formulario.senha.length < 8) novos.senha = 'Use pelo menos 8 caracteres.'
        if (formulario.confirmarSenha !== formulario.senha) novos.confirmarSenha = 'As senhas não são iguais.'
        setErros(novos)
        return Object.keys(novos).length === 0
    }
    const enviar = async (event) => {
        event.preventDefault()
        if (!validar() || salvando) return
        setSalvando(true)
        try {
            const { data } = await axios.post(`${API_URL}/usuario/cadastro`, {
                nome: formulario.nome.trim(), cpf: numeros(formulario.cpf),
                email: formulario.email.trim().toLocaleLowerCase('pt-BR'), senha: formulario.senha,
            })
            toast.success(data.message || 'Cadastro realizado com sucesso.')
            navigate('/')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Não foi possível realizar o cadastro.')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <main className="min-h-screen bg-surface px-4 py-8 md:py-12">
            <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-soft lg:grid-cols-[0.85fr_1.15fr]">
                <section className="hidden flex-col justify-between bg-primary-container p-10 text-on-primary-container lg:flex"><div><img alt="CleanCare" className="h-20 w-20 rounded-2xl object-contain" src="/cleancare_logo.png" /><h1 className="mt-8 font-headline-lg text-headline-lg">Faça parte da CleanCare</h1><p className="mt-3 text-body-lg opacity-90">Crie sua conta para acessar o sistema de gestão de serviços e agendamentos.</p></div><div className="flex items-start gap-3 rounded-xl bg-on-primary/10 p-4"><FiShield className="mt-1 shrink-0" aria-hidden="true" /><p className="text-body-sm">Sua conta será criada como funcionário e ficará pendente até a ativação por um administrador.</p></div></section>
                <section className="p-6 sm:p-10"><Link className="inline-flex items-center gap-2 text-label-md text-primary hover:underline" to="/"><FiArrowLeft aria-hidden="true" />Voltar para o login</Link><div className="mt-6"><h2 className="font-headline-lg text-headline-lg text-on-surface">Criar conta</h2><p className="mt-1 text-body-md text-on-surface-variant">Preencha seus dados para solicitar acesso.</p></div>
                    <form className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate onSubmit={enviar}>
                        <Campo className="sm:col-span-2" erro={erros.nome} Icone={FiUser} id="nome" label="Nome completo" name="nome" onChange={alterar} placeholder="Seu nome completo" value={formulario.nome} />
                        <Campo erro={erros.cpf} id="cpf" inputMode="numeric" label="CPF" maxLength="14" name="cpf" onChange={alterar} placeholder="000.000.000-00" value={formulario.cpf} />
                        <Campo erro={erros.email} Icone={FiMail} id="email" label="E-mail" name="email" onChange={alterar} placeholder="voce@exemplo.com" type="email" value={formulario.email} />
                        <CampoSenha erro={erros.senha} id="senha" label="Senha" mostrar={mostrarSenha} name="senha" onChange={alterar} placeholder="Mínimo de 8 caracteres" value={formulario.senha} />
                        <CampoSenha erro={erros.confirmarSenha} id="confirmarSenha" label="Confirmar senha" mostrar={mostrarSenha} name="confirmarSenha" onChange={alterar} placeholder="Repita sua senha" value={formulario.confirmarSenha} />
                        <label className="flex items-center gap-2 text-body-sm text-on-surface-variant sm:col-span-2"><input checked={mostrarSenha} className="h-4 w-4 accent-primary" onChange={(event) => setMostrarSenha(event.target.checked)} type="checkbox" />Mostrar senhas</label>
                        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60 sm:col-span-2" disabled={salvando} type="submit"><FiSave aria-hidden="true" />{salvando ? 'Cadastrando...' : 'Criar minha conta'}</button>
                    </form><p className="mt-6 text-center text-body-sm text-on-surface-variant">Já possui uma conta? <Link className="font-semibold text-primary hover:underline" to="/">Entrar</Link></p>
                </section>
            </div>
        </main>
    )
}

const Campo = ({ className = '', erro, Icone, id, label, ...props }) => <label className={`space-y-2 ${className}`} htmlFor={id}><span className="text-label-md text-on-surface">{label}<span className="text-error"> *</span></span><span className="relative block">{Icone && <Icone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />}<input aria-invalid={Boolean(erro)} className={`h-12 w-full rounded-lg border bg-surface px-4 text-on-surface focus:outline-none focus:ring-2 ${Icone ? 'pl-10' : ''} ${erro ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`} id={id} required {...props} /></span>{erro && <span className="block text-body-sm text-error">{erro}</span>}</label>
const CampoSenha = ({ erro, id, label, mostrar, ...props }) => <label className="space-y-2" htmlFor={id}><span className="text-label-md text-on-surface">{label}<span className="text-error"> *</span></span><span className="relative block"><FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" /><input aria-invalid={Boolean(erro)} className={`h-12 w-full rounded-lg border bg-surface pl-10 pr-10 text-on-surface focus:outline-none focus:ring-2 ${erro ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/20'}`} id={id} required type={mostrar ? 'text' : 'password'} {...props} />{mostrar ? <FiEye className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" /> : <FiEyeOff className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />}</span>{erro && <span className="block text-body-sm text-error">{erro}</span>}</label>

export default CadastroUsuario
