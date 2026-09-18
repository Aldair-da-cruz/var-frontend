'use client'

import { api } from '@/lib/api'
import Cookies from 'js-cookie'
import { Check } from 'lucide-react'
import { useState } from 'react'


export default function Home() {
 

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const [showWelcome, setShowWelcome] = useState(false)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)

  const [totpUsuarioId, setTotpUsuarioId] = useState('')
  const [totpCodigo, setTotpCodigo] = useState('')
  const [totpErro, setTotpErro] = useState('')

  const entrarComSessao = (data: { token: string; usuario: any }) => {
    Cookies.set('token', data.token, { path: '/' })
    Cookies.set('usuario', JSON.stringify(data.usuario), { path: '/' })

    setUserName(data.usuario.nome)
    setShowWelcome(true)

     setTimeout(() => {
  if (data.usuario.papel === 'ADM') {
    window.location.href = '/adm/dashboard'
    return
  }

  if (data.usuario.papel === 'Operacional') {
    window.location.href = '/operacional/dashboard'
    return
  }

  if (data.usuario.papel === 'Cliente') {
    window.location.href = '/cliente/dashboard'
    return
  }

  window.location.href = '/'
}, 1500)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const response = await api.post('/auth/login', {
        email,
        senha: password,
      })

      const data = response.data.data

      if (data?.totpRequerido) {
        setTotpUsuarioId(data.usuarioId)
        return
      }

      if (!data?.token) {
        throw new Error('Token não recebido')
      }

      entrarComSessao(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao fazer login'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTotpErro('')

    try {
      setLoading(true)
      const response = await api.post('/auth/login/totp', {
        usuarioId: totpUsuarioId,
        codigo:    totpCodigo,
      })
      const data = response.data.data
      if (!data?.token) throw new Error('Token não recebido')
      entrarComSessao(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setTotpErro(error?.response?.data?.message ?? 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-[url('/login.jpg')] bg-cover bg-center scale-110 pointer-events-none"
        style={{ filter: 'blur(6px)' }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Modal verificação 2FA */}
      {totpUsuarioId && !showWelcome && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <form
            onSubmit={handleTotpSubmit}
            className="bg-gradient-to-br from-[#040928] to-[#0e1a3a] border border-[#050e4c] rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col gap-4"
          >
            <h2 className="text-xl font-bold text-white">Verificação em dois fatores</h2>
            <p className="text-gray-400 text-sm">Introduz o código de 6 dígitos da tua aplicação autenticadora.</p>

            {totpErro && (
              <div className="p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{totpErro}</div>
            )}

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={totpCodigo}
              onChange={(e) => setTotpCodigo(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              autoFocus
              className="p-3 text-center text-2xl tracking-[0.5em] border border-[#050e4c] rounded-lg outline-none bg-[#03031b] text-white focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={loading || totpCodigo.length !== 6}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'A verificar...' : 'Verificar'}
            </button>
            <button
              type="button"
              onClick={() => { setTotpUsuarioId(''); setTotpCodigo(''); setTotpErro('') }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Voltar ao login
            </button>
          </form>
        </div>
      )}

      {/* Welcome modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#040928] to-[#0e1a3a] border border-[#050e4c] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">

            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} className="text-green-500" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vindo, {userName}!
            </h2>

            <p className="text-gray-400 mb-6">
              Login realizado com sucesso.
            </p>

            <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex justify-center items-center gap-10 p-5">

        {/* Left */}
        <div className="hidden lg:flex p-5 w-[700px] text-sm flex-col gap-10">

          <div className="py-3 px-6 bg-[#3e3c3c6a] text-white flex flex-col rounded-4xl backdrop-blur-sm">
            <span>Transformamos ideias em soluções inteligentes.</span>
            <span>Inove mais.</span>
            <span>Concentre-se no seu sonho.</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="py-3 px-6 bg-[#3e3c3c6a] text-white rounded-4xl backdrop-blur-sm">
              Do conceito à execução.
            </div>

            <div className="py-3 px-6 bg-[#3e3c3c6a] text-white rounded-4xl backdrop-blur-sm ml-8">
              Tecnologia de ponta para o seu sucesso.
            </div>

            <div className="py-3 px-6 bg-[#3e3c3c6a] text-white rounded-4xl backdrop-blur-sm ml-16">
              Soluções rápidas e escaláveis.
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="text-4xl text-white font-semibold">
              Controle total da sua empresa
            </h1>

            <div className="flex flex-col gap-2 text-white">
              <div className="flex items-center gap-2">
                <Check color="#00adff" size={18} />
                <span>Tecnologia de ponta</span>
              </div>

              <div className="flex items-center gap-2">
                <Check color="#00adff" size={18} />
                <span>Soluções inteligentes</span>
              </div>

              <div className="flex items-center gap-2">
                <Check color="#00adff" size={18} />
                <span>Escalabilidade empresarial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login */}
        <form
          onSubmit={handleLogin}
          className="relative z-20 p-8 w-full max-w-[500px] bg-white/90 backdrop-blur-md shadow-2xl flex flex-col rounded-2xl gap-6"
        >

          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold">
              Bem-vindo
            </h1>

            <span className="text-gray-600">
              Faça login para continuar
            </span>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email">
              Email
            </label>

            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email"
              required
              className="p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password">
              Senha
            </label>

            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              required
              className="p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Remember */}
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Lembrar-me
            </label>

            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

