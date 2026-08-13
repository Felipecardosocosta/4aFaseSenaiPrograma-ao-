import { useState } from 'react'
import axios from 'axios'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!email.trim() || !senha) {
            toast.error('Informe o e-mail e a senha.')
            return
        }

        if (isLoading) return

        setIsLoading(true)

        try {
            const { data } = await axios.post(`${API_URL}/usuario/login`, {
                email: email.trim(),
                senha,
            })

            if (!data?.token) {
                throw new Error('A resposta do servidor não contém um token válido.')
            }

            localStorage.setItem('token', data.token)
            toast.success(data.message || 'Login realizado com sucesso.')
            navigate('/dashboard')
        } catch (error) {
            const apiMessage = error.response?.data?.message
            const localMessage = !axios.isAxiosError(error) ? error.message : null

            toast.error(apiMessage || localMessage || 'Não foi possível realizar o login. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full w-full flex items-center justify-center bg-surface px-margin-mobile">
            <div className="relative mt-8 w-2/6 overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-soft sm:p-8">
                <div className="absolute top-0 left-0  h-1 bg-primary" />

                <div className="flex justify-center mb-8">
                    <img
                        alt="CleanCare Logo"
                        className="w-24 h-24 object-contain rounded-2xl"
                        src="../cleancare_logo.png"
                    />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-headline-md font-headline-md text-on-surface mb-2">Seja bem-vindo!</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant">Por favor, insira seus dados para fazer login.</p>
                </div>

                <form className="space-y-7" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <input
                                autoComplete="email"
                                className="w-full pl-6 pr-4 py-3 bg-surface border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                id="email"
                                name="email"
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Entre com email"
                                type="email"
                                value={email}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-label-md font-label-md text-on-surface-variant" htmlFor="password">
                                Senha
                            </label>
                            <a className="text-label-md font-label-md text-primary hover:text-primary-container transition-colors" href="#">
                                Esqueceu sua senha?
                            </a>
                        </div>
                        <div className="relative">
                            <input
                                autoComplete="current-password"
                                className="w-full pl-6 pr-12 py-3 bg-surface border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                id="password"
                                name="password"
                                onChange={(event) => setSenha(event.target.value)}
                                placeholder="••••••••"
                                type={showPassword ? 'text' : 'password'}
                                value={senha}
                            />
                            <button
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                aria-pressed={showPassword}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                                onClick={() => setShowPassword((visible) => !visible)}
                                type="button"
                            >
                                {!showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                            id="remember-me"
                            name="remember-me"
                            type="checkbox" />
                        <label className="ml-2 block text-body-md font-body-md text-on-surface-variant" htmlFor="remember-me">
                            Lembrar de mim
                        </label>
                    </div>

                    <div className="pt-4">
                        <button
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-body-lg font-body-lg font-semibold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isLoading}
                            type="submit"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-body-sm text-on-surface-variant">
                    Ainda não possui uma conta?{' '}
                    <Link className="font-semibold text-primary hover:underline" to="/cadastro">Cadastre-se</Link>
                </p>
            </div>
        </div>
    )
}

export default Login
