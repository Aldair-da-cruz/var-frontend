'use client'
import { useState, useEffect, useCallback } from "react"
import Caixa3 from "@/components/caixa3"
import Container2 from "@/components/container2"
import Sidebar from "@/components/sidebar"
import TabelaNotificacoes from "@/components/tabelaNoti"
import { Bell, Search, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"

interface Pagamento {
  id:              string
  valor:           number
  moeda:           string
  status:          'Pendente' | 'Concluido' | 'Reembolsado'
  referencia:      string | null
  criadoEm:        string
  empresa:         { id: string; nome: string }
  licenca:         { id: string; plano: string }
}

interface ResumoCards {
  concluidos: number
  pendentes:  number
  reembolsados: number
  total:      number
}

export default function Home() {
  const [pagamentos,    setPagamentos]    = useState<Pagamento[]>([])
  const [resumo,        setResumo]        = useState<ResumoCards>({ concluidos: 0, pendentes: 0, reembolsados: 0, total: 0 })
  const [search,        setSearch]        = useState('')
  const [filtroStatus,  setFiltroStatus]  = useState('')
  const [carregando,    setCarregando]    = useState(true)
  const [paginaAtual,   setPaginaAtual]   = useState(1)
  const [totalPaginas,  setTotalPaginas]  = useState(1)
  const [mostrarNoti,   setMostrarNoti]   = useState(false)

  const [nomeUsuario, setNomeUsuario] = useState('ADM')

  useEffect(() => {
    try { setNomeUsuario(JSON.parse(Cookies.get('usuario') ?? '{}').nome ?? 'ADM') } catch { /* ignora */ }
  }, [])

  const carregarPagamentos = useCallback(async () => {
    try {
      setCarregando(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { page: paginaAtual, limit: 10 }
      if (filtroStatus) params.status = filtroStatus

      const res = await api.get('/pagamentos', { params })
      setPagamentos(res.data.data)
      setTotalPaginas(res.data.meta.totalPages)

      // Calcular resumo dos cards
      const [concRes, penRes, remRes, totRes] = await Promise.allSettled([
        api.get('/pagamentos', { params: { status: 'Concluido', limit: 1 } }),
        api.get('/pagamentos', { params: { status: 'Pendente',  limit: 1 } }),
        api.get('/pagamentos', { params: { status: 'Reembolsado', limit: 1 } }),
        api.get('/pagamentos', { params: { limit: 1 } }),
      ])
      setResumo({
        concluidos:   concRes.status === 'fulfilled' ? concRes.value.data.meta.total : 0,
        pendentes:    penRes.status  === 'fulfilled' ? penRes.value.data.meta.total  : 0,
        reembolsados: remRes.status  === 'fulfilled' ? remRes.value.data.meta.total  : 0,
        total:        totRes.status  === 'fulfilled' ? totRes.value.data.meta.total   : 0,
      })
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err)
    } finally {
      setCarregando(false)
    }
  }, [paginaAtual, filtroStatus])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarPagamentos()
  }, [carregarPagamentos])

  const atualizarStatus = async (id: string, status: 'Concluido' | 'Pendente' | 'Reembolsado') => {
    try {
      await api.patch(`/pagamentos/${id}`, { status })
      carregarPagamentos()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao actualizar status.')
    }
  }

  const caixasData = [
    { icon: <CheckCircle size={24} className="text-green-500" />,  num: resumo.concluidos,   descricao: "Pagamentos confirmados" },
    { icon: <Clock       size={24} className="text-yellow-500" />, num: resumo.pendentes,    descricao: "Pagamentos pendentes" },
    { icon: <XCircle     size={24} className="text-red-500" />,    num: resumo.reembolsados, descricao: "Pagamentos reembolsados" },
    { icon: <AlertTriangle size={24} className="text-orange-500" />, num: resumo.total,      descricao: "Total de pagamentos" },
  ]

  const dadosTabela = pagamentos.map((p) => ({
    id:              p.id,
    empresa:         p.empresa?.nome ?? '-',
    licenca:         p.licenca?.plano ?? '-',
    valor:           Number(p.valor),
    date:            new Date(p.criadoEm).toLocaleDateString('pt-PT'),
    status:          p.status === 'Concluido' ? 'Pago' : p.status === 'Reembolsado' ? 'Recusado' : 'Pendente',
    metodoPagamento: p.referencia ?? '-',
    onAceitar:       () => atualizarStatus(p.id, 'Concluido'),
    onRecusar:       () => atualizarStatus(p.id, 'Reembolsado'),
    onPendente:      () => atualizarStatus(p.id, 'Pendente'),
  }))

  return (
    <>
      <Sidebar>
        <Container2
          titulo="Gerir pagamento"
          notificacao={<Bell size={20} />}
          usuario={nomeUsuario}
          onAdicionar={() => setMostrarNoti(true)}
          filtros={
            <>
              <select
                value={filtroStatus}
                onChange={(e) => { setFiltroStatus(e.target.value); setPaginaAtual(1) }}
                className="bg-[#040928] text-white border border-[#050e4c] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="Concluido">Concluído</option>
                <option value="Pendente">Pendente</option>
                <option value="Reembolsado">Reembolsado</option>
              </select>
            </>
          }
        >
          {!mostrarNoti ? (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {caixasData.map((item, index) => (
                  <Caixa3 key={index} icon={item.icon} num={item.num} descricao={item.descricao} />
                ))}
              </div>

              <div className="flex justify-end w-full mb-4">
                <div className="w-[300px] bg-[#040928] text-white h-10 flex items-center gap-3 border border-[#050e4c] rounded-lg">
                  <Search size={18} className="ml-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="outline-none placeholder:text-gray-500 h-10 w-full bg-transparent text-sm text-white"
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="p-4 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl">
                  {carregando ? (
                    <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="min-w-[600px]">
                        <TabelaNotificacoes dados={[]} dados2={dadosTabela} />
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
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setMostrarNoti(false)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  ← Voltar
                </button>
                <h2 className="text-white text-xl font-semibold">Pagamentos pendentes</h2>
                <div className="w-20"></div>
              </div>

              <div className="w-full">
                <div className="p-4 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl">
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <TabelaNotificacoes
                        dados={pagamentos.filter(p => p.status === 'Pendente').map((p, i) => ({
                          id:              i + 1,
                          empresa:         p.empresa?.nome ?? '-',
                          licenca:         p.licenca?.plano ?? '-',
                          chaveLicenca:    p.id.slice(0, 8).toUpperCase(),
                          valor:           Number(p.valor).toLocaleString('pt-PT'),
                          metodoPagamento: p.referencia ?? '-',
                          status:          'Pendente',
                          data:            new Date(p.criadoEm).toLocaleDateString('pt-PT'),
                          onAceitar:       () => atualizarStatus(p.id, 'Concluido'),
                          onRecusar:       () => atualizarStatus(p.id, 'Reembolsado'),
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Container2>
      </Sidebar>
    </>
  )
}