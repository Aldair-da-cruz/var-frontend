'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Caixa5 from "@/components/caixa5"
import Container from "@/components/container"
import FiltrosFuncionarios from "@/components/filtroFuncionario"
import Sidebar2 from "@/components/sidbar2"
import Tabela6, { Funcionario } from "@/components/tabela6"
import { Bell, UserCheck, Users2, UserX, X } from "lucide-react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"
import { useUsuarioPermissoes } from "@/hooks/useUsuarioPermissoes"

interface FuncionarioAPI {
  id:        string
  nome:      string
  cargo:     string
  telefone:  string | null
  status:    'Ativo' | 'Inativo' | 'Pendente'
  criadoEm:  string
  updatedAt: string
}

interface ResumoCards {
  total:     number
  ativos:    number
  inativos:  number
  pendentes: number
}

export default function Dashboard() {
  const router = useRouter()
  const { permissaoGestao } = useUsuarioPermissoes()

  useEffect(() => {
    if (!permissaoGestao) router.replace('/cliente/dashboard')
  }, [permissaoGestao, router])

  const [funcionarios,   setFuncionarios]   = useState<FuncionarioAPI[]>([])
  const [resumo,         setResumo]         = useState<ResumoCards>({ total: 0, ativos: 0, inativos: 0, pendentes: 0 })
  const [filtroStatus,   setFiltroStatus]   = useState('')
  const [filtroCargo,    setFiltroCargo]    = useState('')
  const [pesquisa,       setPesquisa]       = useState('')
  const [carregando,     setCarregando]     = useState(true)
  const [paginaAtual,    setPaginaAtual]    = useState(1)
  const [totalPaginas,   setTotalPaginas]   = useState(1)
  const [empresaId,      setEmpresaId]      = useState('')
  const [nomeUsuario,    setNomeUsuario]    = useState('')

  // Modal novo funcionário
  const [modalNovo,     setModalNovo]     = useState(false)
  const [formNovo,      setFormNovo]      = useState({ nome: '', cargo: '', email: '', telefone: '' })
  const [loadingNovo,   setLoadingNovo]   = useState(false)
  const [erroNovo,      setErroNovo]      = useState('')

  // Modal eliminar
  const [modalEliminar,   setModalEliminar]   = useState(false)
  const [funSel,          setFunSel]          = useState<FuncionarioAPI | null>(null)
  const [loadingEliminar, setLoadingEliminar] = useState(false)

  // Modal alterar status
  const [modalStatus,   setModalStatus]   = useState(false)
  const [novoStatus,    setNovoStatus]    = useState<'Ativo' | 'Inativo' | 'Pendente'>('Ativo')
  const [loadingStatus, setLoadingStatus] = useState(false)

  useEffect(() => {
    try {
      const u = JSON.parse(Cookies.get('usuario') ?? '{}')
      setEmpresaId(u.empresaId ?? '')
      setNomeUsuario(u.nome ?? '')
    } catch { /* ignora */ }
  }, [])

  const carregarFuncionarios = useCallback(async () => {
    if (!empresaId) return
    try {
      setCarregando(true)
      const params: any = { empresaId, page: paginaAtual, limit: 10 }
      if (filtroStatus) params.status = filtroStatus
      if (pesquisa)     params.search = pesquisa

      const res = await api.get('/funcionarios', { params })
      setFuncionarios(res.data.data)
      setTotalPaginas(res.data.meta.totalPages)

      const [tot, ati, ina, pen] = await Promise.allSettled([
        api.get('/funcionarios', { params: { empresaId, limit: 1 } }),
        api.get('/funcionarios', { params: { empresaId, limit: 1, status: 'Ativo' } }),
        api.get('/funcionarios', { params: { empresaId, limit: 1, status: 'Inativo' } }),
        api.get('/funcionarios', { params: { empresaId, limit: 1, status: 'Pendente' } }),
      ])
      setResumo({
        total:     tot.status === 'fulfilled' ? tot.value.data.meta.total : 0,
        ativos:    ati.status === 'fulfilled' ? ati.value.data.meta.total : 0,
        inativos:  ina.status === 'fulfilled' ? ina.value.data.meta.total : 0,
        pendentes: pen.status === 'fulfilled' ? pen.value.data.meta.total : 0,
      })
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err)
    } finally {
      setCarregando(false)
    }
  }, [empresaId, paginaAtual, filtroStatus, pesquisa])

  useEffect(() => {
    const timer = setTimeout(carregarFuncionarios, 300)
    return () => clearTimeout(timer)
  }, [carregarFuncionarios])

  const criarFuncionario = async () => {
    if (!formNovo.nome || !formNovo.cargo || !formNovo.email) {
      setErroNovo('Preenche nome, cargo e email.')
      return
    }
    try {
      setLoadingNovo(true)
      await api.post('/funcionarios', { ...formNovo, empresaId })
      setModalNovo(false)
      setFormNovo({ nome: '', cargo: '', email: '', telefone: '' })
      carregarFuncionarios()
    } catch (err: any) {
      setErroNovo(err?.response?.data?.message ?? 'Erro ao criar funcionário.')
    } finally {
      setLoadingNovo(false)
    }
  }

  const eliminarFuncionario = async () => {
    if (!funSel) return
    try {
      setLoadingEliminar(true)
      await api.delete(`/funcionarios/${funSel.id}`)
      setModalEliminar(false)
      setFunSel(null)
      carregarFuncionarios()
    } catch {
      setModalEliminar(false)
    } finally {
      setLoadingEliminar(false)
    }
  }

  const alterarStatus = async () => {
    if (!funSel) return
    try {
      setLoadingStatus(true)
      await api.patch(`/funcionarios/${funSel.id}`, { status: novoStatus })
      setModalStatus(false)
      setFunSel(null)
      carregarFuncionarios()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao alterar status.')
    } finally {
      setLoadingStatus(false)
    }
  }

  const abrirModalStatus = (f: FuncionarioAPI) => {
    setFunSel(f)
    setNovoStatus(f.status === 'Ativo' ? 'Inativo' : 'Ativo')
    setModalStatus(true)
  }

  const dadosFiltrados: Funcionario[] = funcionarios
    .filter((f) => !filtroCargo || f.cargo === filtroCargo)
    .map((f) => ({
      id:            f.id,
      nome:          f.nome,
      cargo:         f.cargo,
      telefone:      f.telefone ?? '—',
      status:        f.status,
      onEliminar:    () => { setFunSel(f); setModalEliminar(true) },
      onAlterarStatus: () => abrirModalStatus(f),
    }))

  const dataHoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <Sidebar2>
        <Container titulo="Gerir funcionários" notificacao={<Bell size={20} />} usuario={nomeUsuario || dataHoje}>
          <div className="flex justify-around">
            <Caixa5 descricao="Funcionários"           num={resumo.total}     icon={<Users2    size={20} color="white"  />} />
            <Caixa5 descricao="Funcionários activos"   num={resumo.ativos}    icon={<UserCheck size={20} color="green"  />} />
            <Caixa5 descricao="Funcionários inactivos" num={resumo.inativos}  icon={<UserX    size={20} color="red"    />} />
            <Caixa5 descricao="Pendentes"              num={resumo.pendentes} icon={<Bell     size={20} color="yellow" />} />
          </div>

          <FiltrosFuncionarios
            onStatusChange={(s) => { setFiltroStatus(s); setPaginaAtual(1) }}
            onCargoChange={setFiltroCargo}
            onSearchChange={(s) => { setPesquisa(s); setPaginaAtual(1) }}
            onNovoFuncionario={() => { setErroNovo(''); setModalNovo(true) }}
            cargos={Array.from(new Set(funcionarios.map((f) => f.cargo))).sort()}
          />

          <div className="pb-10 w-[1180px] ml-3 mt-2 bg-[#040928] rounded-2xl shadow-xl">
            <div className="px-5 pb-5">
              {carregando ? (
                <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
              ) : (
                <Tabela6 dados={dadosFiltrados} />
              )}

              {totalPaginas > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPaginaAtual(p)}
                      className={`w-8 h-8 rounded-lg text-sm ${p === paginaAtual ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Sidebar2>

      {/* Modal Novo Funcionário */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Novo Funcionário</h2>
              <button onClick={() => setModalNovo(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            {erroNovo && (
              <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroNovo}</div>
            )}
            <div className="flex flex-col gap-3">
              {[
                { label: 'Nome *',   campo: 'nome',     type: 'text' },
                { label: 'Cargo *',  campo: 'cargo',    type: 'text' },
                { label: 'Email *',  campo: 'email',    type: 'email' },
                { label: 'Telefone', campo: 'telefone', type: 'text' },
              ].map(({ label, campo, type }) => (
                <div key={campo} className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">{label}</label>
                  <input type={type} value={(formNovo as any)[campo]}
                    onChange={(e) => setFormNovo((prev) => ({ ...prev, [campo]: e.target.value }))}
                    className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={criarFuncionario} disabled={loadingNovo}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {loadingNovo ? 'A criar...' : 'Criar'}
              </button>
              <button onClick={() => setModalNovo(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alterar Status */}
      {modalStatus && funSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-2">Alterar status</h2>
            <p className="text-gray-300 text-sm mb-4">
              Funcionário: <span className="text-white font-medium">{funSel.nome}</span><br/>
              Status actual: <span className="text-yellow-400">{funSel.status}</span>
            </p>
            <div className="flex flex-col gap-1 mb-6">
              <label className="text-sm text-gray-400">Novo status</label>
              <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value as any)}
                className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={alterarStatus} disabled={loadingStatus}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {loadingStatus ? 'A guardar...' : 'Confirmar'}
              </button>
              <button onClick={() => setModalStatus(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-2">Eliminar funcionário</h2>
            <p className="text-gray-300 text-sm mb-6">
              Tens a certeza que queres eliminar <span className="text-white font-medium">{funSel?.nome}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={eliminarFuncionario} disabled={loadingEliminar}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {loadingEliminar ? 'A eliminar...' : 'Confirmar'}
              </button>
              <button onClick={() => setModalEliminar(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}