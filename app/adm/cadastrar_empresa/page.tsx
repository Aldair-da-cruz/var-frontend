'use client'

import { useEffect, useState } from "react"
import CInput from "@/components/cInput"
import Container from "@/components/container"
import Sidebar from "@/components/sidebar"
import Btn from "@/components/btn"
import { Bell } from "lucide-react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"

export default function Home() {
  const [form, setForm] = useState({
    nome:     '',
    cnpj:     '',
    email:    '',
    telefone: '',
  })

  const [loading,  setLoading]  = useState(false)
  const [sucesso,  setSucesso]  = useState(false)
  const [erro,     setErro]     = useState('')
  const [nomeUsuario, setNomeUsuario] = useState('ADM')

  useEffect(() => {
    try { setNomeUsuario(JSON.parse(Cookies.get('usuario') ?? '{}').nome ?? 'ADM') } catch { /* ignora */ }
  }, [])

  const handleChange = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))
    setErro('')
    setSucesso(false)
  }

  const handleSubmit = async () => {
    if (!form.nome || !form.cnpj || !form.email) {
      setErro('Preencha os campos obrigatórios: Nome, NIF e Email.')
      return
    }

    try {
      setLoading(true)
      await api.post('/empresas', form)
      setSucesso(true)
      setForm({ nome: '', cnpj: '', email: '', telefone: '' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Erro ao cadastrar empresa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Sidebar>
        <Container titulo="Formulário de Cadastro" notificacao={<Bell size={20} />} usuario={nomeUsuario}>
          <div className="py-4 bg-white/5 rounded-lg px-4">

            {sucesso && (
              <div className="mb-4 p-3 rounded-lg bg-green-600/20 border border-green-600 text-green-400 text-sm">
                Empresa cadastrada com sucesso!
              </div>
            )}

            {erro && (
              <div className="mb-4 p-3 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">
                {erro}
              </div>
            )}

            <div className="flex flex-col gap-4 py-4">
              <CInput
                label="Nome da empresa *"
                type="text"
                placeholder="Digite o nome da empresa"
                value={form.nome}
                onChange={handleChange('nome')}
              />
              <CInput
                label="NIF da empresa *"
                type="text"
                placeholder="Digite o NIF da empresa"
                value={form.cnpj}
                onChange={handleChange('cnpj')}
              />
              <CInput
                label="Email da empresa *"
                type="email"
                placeholder="Digite o email da empresa"
                value={form.email}
                onChange={handleChange('email')}
              />
              <CInput
                label="Telefone"
                type="text"
                placeholder="Digite o telefone da empresa"
                value={form.telefone}
                onChange={handleChange('telefone')}
              />
            </div>

            <div className="flex justify-end mt-6 pb-4">
              <Btn
                botao={loading ? 'A cadastrar...' : 'Finalizar Cadastro'}
                onClick={handleSubmit}
                disabled={loading}
              />
            </div>
          </div>
        </Container>
      </Sidebar>
    </>
  )
}