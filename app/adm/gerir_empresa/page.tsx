'use client'

import { useEffect, useState, useCallback } from "react"
import Container from "@/components/container"
import Sidebar from "@/components/sidebar"
import Tabela2 from "@/components/tabela2"
import { Search, Bell, Calendar } from "lucide-react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"

interface Empresa {
  id:       string
  nome:     string
  cnpj:     string
  email:    string
  telefone: string | null
  status:   'Ativo' | 'Inativo'
}

export default function Home() {
  const [empresas,     setEmpresas]     = useState<Empresa[]>([])
  const [search,       setSearch]       = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'Ativo' | 'Inativo'>('Ativo')
  const [carregando,   setCarregando]   = useState(true)
  const [erro,         setErro]         = useState('')
  const [paginaAtual,  setPaginaAtual]  = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  // Modal editar
  const [modalEditar,   setModalEditar]   = useState(false)
  const [empresaSel,    setEmpresaSel]    = useState<Empresa | null>(null)
  const [formEditar,    setFormEditar]    = useState({ nome: '', email: '', telefone: '' })
  const [loadingEditar, setLoadingEditar] = useState(false)
  const [erroEditar,    setErroEditar]    = useState('')

  // Modal confirmar acção
  const [modalAccao,    setModalAccao]    = useState(false)
  const [tipoAccao,     setTipoAccao]     = useState<'ativar' | 'desativar'>('desativar')
  const [loadingAccao,  setLoadingAccao]  = useState(false)

  const [nomeUsuario, setNomeUsuario] = useState('ADM')

  useEffect(() => {
    try { setNomeUsuario(JSON.parse(Cookies.get('usuario') ?? '{}').nome ?? 'ADM') } catch { /* ignora */ }
  }, [])

  const dataHoje = new Date().toLocaleDateString('pt-PT')

  const carregarEmpresas = useCallback(async () => {
    try {
      setCarregando(true)
      const res = await api.get('/empresas', {
        params: { page: paginaAtual, limit: 10, search: search || undefined, status: filtroStatus },
      })
      setEmpresas(res.data.data)
      setTotalPaginas(res.data.meta.totalPages)
    } catch {
      setErro('Erro ao carregar empresas.')
    } finally {
      setCarregando(false)
    }
  }, [paginaAtual, search, filtroStatus])

  useEffect(() => {
    const timer = setTimeout(carregarEmpresas, 300)
    return () => clearTimeout(timer)
  }, [carregarEmpresas])

  const abrirEditar = (empresa: Empresa) => {
    setEmpresaSel(empresa)
    setFormEditar({ nome: empresa.nome, email: empresa.email, telefone: empresa.telefone ?? '' })
    setErroEditar('')
    setModalEditar(true)
  }

  const salvarEditar = async () => {
    if (!empresaSel) return
    try {
      setLoadingEditar(true)
      await api.patch(`/empresas/${empresaSel.id}`, formEditar)
      setModalEditar(false)
      carregarEmpresas()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErroEditar(err?.response?.data?.message ?? 'Erro ao actualizar.')
    } finally {
      setLoadingEditar(false)
    }
  }

  const abrirAccao = (empresa: Empresa, tipo: 'ativar' | 'desativar') => {
    setEmpresaSel(empresa)
    setTipoAccao(tipo)
    setModalAccao(true)
  }

  const confirmarAccao = async () => {
    if (!empresaSel) return
    try {
      setLoadingAccao(true)
      if (tipoAccao === 'desativar') {
        await api.delete(`/empresas/${empresaSel.id}`)
      } else {
        await api.patch(`/empresas/${empresaSel.id}/ativar`)
      }
      setModalAccao(false)
      setEmpresaSel(null)
      carregarEmpresas()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao realizar acção.')
      setModalAccao(false)
    } finally {
      setLoadingAccao(false)
    }
  }

  const dadosTabela = empresas.map((e, i) => ({
    id:               (paginaAtual - 1) * 10 + i + 1,
    designacaoSocial: e.nome,
    nif:              e.cnpj,
    contacto:         e.telefone ?? e.email,
    status:           e.status,
    onEditar:         () => abrirEditar(e),
    onDesativar:      () => abrirAccao(e, 'desativar'),
    onAtivar:         () => abrirAccao(e, 'ativar'),
  }))

  return (
    <>
      <Sidebar>
        <Container titulo="Gerir Empresas" notificacao={<Bell size={20} />} usuario={nomeUsuario}>

          <div className="text-white flex items-center justify-between w-full py-4">
            <div className="flex items-center gap-3">
              {/* Pesquisa */}
              <div className="w-[260px] bg-[#040928] text-white h-10 flex items-center gap-3 border border-[#050e4c] rounded-lg">
                <Search size={18} className="ml-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPaginaAtual(1) }}
                  className="outline-none placeholder:text-gray-500 h-10 w-full bg-transparent text-sm text-white"
                />
              </div>

              {/* Filtro status */}
              <div className="flex gap-1 bg-[#040928] border border-[#050e4c] rounded-lg p-1">
                {(['Ativo', 'Inativo'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFiltroStatus(s); setPaginaAtual(1) }}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${filtroStatus === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#040928] text-white h-10 w-[140px] border border-[#050e4c] rounded-lg justify-center">
              <Calendar size={16} className="text-gray-400" />
              <p className="text-sm">{dataHoje}</p>
            </div>
          </div>

          {erro && (
            <div className="mb-4 p-3 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erro}</div>
          )}

          <div className="w-full mt-4">
            <div className="p-4 rounded-2xl shadow-xl bg-[#040928] border border-[#050e4c]">
              {carregando ? (
                <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <Tabela2 dados={dadosTabela} />
                  </div>
                </div>
              )}

              {totalPaginas > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPaginaAtual(p)}
                      className={`w-8 h-8 rounded-lg text-sm ${p === paginaAtual ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Sidebar>

      {/* Modal Editar */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Editar Empresa</h2>
            {erroEditar && (
              <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroEditar}</div>
            )}
            <div className="flex flex-col gap-3">
              {[{ label: 'Nome', campo: 'nome' }, { label: 'Email', campo: 'email' }, { label: 'Telefone', campo: 'telefone' }].map(({ label, campo }) => (
                <div key={campo} className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">{label}</label>
                  <input
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(formEditar as any)[campo]}
                    onChange={(e) => setFormEditar((prev) => ({ ...prev, [campo]: e.target.value }))}
                    className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={salvarEditar} disabled={loadingEditar}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {loadingEditar ? 'A guardar...' : 'Guardar'}
              </button>
              <button onClick={() => setModalEditar(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Activar/Desactivar */}
      {modalAccao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-2">
              {tipoAccao === 'desativar' ? 'Desactivar empresa' : 'Activar empresa'}
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              Tens a certeza que queres {tipoAccao === 'desativar' ? 'desactivar' : 'activar'} a empresa{' '}
              <span className="text-white font-medium">{empresaSel?.nome}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={confirmarAccao} disabled={loadingAccao}
                className={`flex-1 text-white py-2 rounded-lg text-sm disabled:opacity-50 ${tipoAccao === 'desativar' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {loadingAccao ? 'A processar...' : 'Confirmar'}
              </button>
              <button onClick={() => setModalAccao(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}