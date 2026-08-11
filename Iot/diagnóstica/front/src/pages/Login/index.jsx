import { useState } from 'react'
import axios from 'axios'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Login = () => {
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
        } catch (error) {
            const apiMessage = error.response?.data?.message
            const localMessage = !axios.isAxiosError(error) ? error.message : null

            toast.error(apiMessage || localMessage || 'Não foi possível realizar o login. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full flex items-center justify-center bg-surface px-margin-mobile">
            <div className="w-full max-w-md bg-surface-container-lowest rounded-xl p-8 ambient-shadow relative overflow-hidden mt-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

                <div className="flex justify-center mb-8">
                    <img
                        alt="CleanCare Logo"
                        className="w-24 h-24 object-contain rounded-2xl"
                        src="https://lh3.googleusercontent.com/aida/AP1WRLtBw027CMlNQoouos-rbzeBOLcBXkEiBWO9hf-ksaP5XtnHMmCmJpDRq__YheET60TazRA0giDw4MIgI3_xLMOLnofITvPuJS8eSVecWDZ51-1DjGkemtFr5Ls5DoPxY3-i9F60nisIBnJGTTnVzohkF_B7KCP_FM2Lms4a26P11EwjaZ-Z7XB1jMhuXvYi5z3XzcueSmABwBUcRpV8EPAEDY4a_rtb6R7Xr8-hGckFf84HD0Y2_AQcnhmL"
                    />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-headline-md font-headline-md text-on-surface mb-2">Welcome Back</h1>
                    <p className="text-body-md font-body-md text-on-surface-variant">Please enter your details to sign in.</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-label-md font-label-md text-on-surface-variant mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                autoComplete="email"
                                className="w-full pl-6 pr-4 py-3 bg-surface border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                id="email"
                                name="email"
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="Enter your email"
                                type="email"
                                value={email}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-label-md font-label-md text-on-surface-variant" htmlFor="password">
                                Password
                            </label>
                            <a className="text-label-md font-label-md text-primary hover:text-primary-container transition-colors" href="#">
                                Forgot password?
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
                                {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded" id="remember-me" name="remember-me" type="checkbox" />
                        <label className="ml-2 block text-body-md font-body-md text-on-surface-variant" htmlFor="remember-me">
                            Remember me
                        </label>
                    </div>

                    <div className="pt-4">
                        <button
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-[12px] shadow-sm text-body-lg font-body-lg font-semibold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isLoading}
                            type="submit"
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
