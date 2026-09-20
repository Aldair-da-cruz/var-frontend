'use client'
import { useEffect, useState, useCallback } from "react"
import Caixa5 from "@/components/caixa5"
import Container from "@/components/container"
import Sidebar3 from "@/components/sidbar3"
import { Bell, CreditCard, CheckCircle2, AlertTriangle, Ban, X, Pencil, PauseCircle, PlayCircle } from "lucide-react"
import { useUsuarioNome } from "@/hooks/useUsuarioNome"
import { licencaService, pagamentoService, relatorioService } from "@/services"

interface LicencaAPI {
  id: string
  plano: 'Basico' | 'Profissional' | 'Premium'
  status: string
  statusCalculado: 'Ativa' | 'Expirada' | 'Suspensa'
  diasRestantes: number
  expiraEm: string
  inicioEm: string
  maxDeFuncionarios: number
  empresa: { id: string; nome: string }
}

interface PagamentoAPI {
  id: string
  valor: number
  moeda: string
  status: 'Pendente' | 'Concluido' | 'Reembolsado'
  referencia: string | null
  criadoEm: string
  empresa: { id: string; nome: string }
  licenca: { id: string; plano: string }
}

interface Metricas {
  ativas: number
  expiradas: number
  suspensas: number
  aExpirar: number
  receitaTotal: number
}

export default function LicencasPagamentos() {
  const nomeUsuario = useUsuarioNome()
  const [aba, setAba] = useState<'licencas' | 'pagamentos'>('licencas')
  const [licencas, setLicencas] = useState<LicencaAPI[]>([])
  const [pagamentosPendentes, setPagamentosPendentes] = useState<PagamentoAPI[]>([])
  const [metricas, setMetricas] = useState<Metricas>({ ativas: 0, expiradas: 0, suspensas: 0, aExpirar: 0, receitaTotal: 0 })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [modalEditar, setModalEditar] = useState(false)
  const [licencaSel, setLicencaSel] = useState<LicencaAPI | null>(null)
  const [formEditar, setFormEditar] = useState({ plano: 'Basico', expiraEm: '' })
  const [loadingEditar, setLoadingEditar] = useState(false)

  const [processando, setProcessando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    try {
      setCarregando(true)
      const [resLicencas, resPagamentos, resRelLicencas, resFinanceiro] = await Promise.allSettled([
        licencaService.listar({ limit: 100 }),
        pagamentoService.listar({ status: 'Pendente', limit: 100 }),
        relatorioService.licencas(),
        relatorioService.financeiro(),
      ])

      setLicencas(resLicencas.status === 'fulfilled' ? resLicencas.value.data.data as unknown as LicencaAPI[] : [])
      setPagamentosPendentes(resPagamentos.status === 'fulfilled' ? resPagamentos.value.data.data as unknown as PagamentoAPI[] : [])

      const rel = resRelLicencas.status === 'fulfilled' ? (resRelLicencas.value.data as any).data : null
      const fin = resFinanceiro.status === 'fulfilled' ? (resFinanceiro.value.data as any).data : null

      setMetricas({
        ativas:       rel?.porStatus?.ativas ?? 0,
        expiradas:    rel?.porStatus?.expiradas ?? 0,
        suspensas:    rel?.porStatus?.suspensas ?? 0,
        aExpirar:     rel?.aExpirarEm30Dias?.length ?? 0,
        receitaTotal: fin?.receitaTotal ?? 0,
      })

      setErro('')
    } catch {
      setErro('Erro ao carregar licenças e pagamentos.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const abrirEditar = (l: LicencaAPI) => {
    setLicencaSel(l)
    setFormEditar({ plano: l.plano, expiraEm: l.expiraEm.slice(0, 10) })
    setModalEditar(true)
  }

  const salvarEditar = async () => {
    if (!licencaSel) return
    try {
      setLoadingEditar(true)
      await licencaService.atualizar(licencaSel.id, { plano: formEditar.plano as any, expiraEm: formEditar.expiraEm as any })
      setModalEditar(false)
      carregar()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao actualizar licença.')
    } finally {
      setLoadingEditar(false)
    }
  }

  const alternarSuspensao = async (l: LicencaAPI) => {
    try {
      setProcessando(l.id)
      await licencaService.atualizar(l.id, { status: l.statusCalculado === 'Suspensa' ? 'Ativa' : 'Suspensa' } as any)
      carregar()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao alterar estado da licença.')
    } finally {
      setProcessando(null)
    }
  }

  const decidirPagamento = async (id: string, status: 'Concluido' | 'Reembolsado') => {
    try {
      setProcessando(id)
      await pagamentoService.atualizar(id, { status })
      carregar()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro ao processar pagamento.')
    } finally {
      setProcessando(null)
    }
  }

  const corStatus = (s: string) =>
    s === 'Ativa' ? 'text-green-400' : s === 'Suspensa' ? 'text-yellow-400' : 'text-red-400'

  return (
    <div>
      <Sidebar3>
        <Container titulo="Licenças & Pagamentos" notificacao={<Bell size={20} />} usuario={nomeUsuario}>

          <div className="flex justify-around mb-4">
            <Caixa5 descricao="Licenças activas" num={metricas.ativas} icon={<CheckCircle2 size={20} color="green" />} />
            <Caixa5 descricao="A expirar (30 dias)" num={metricas.aExpirar} icon={<AlertTriangle size={20} color="yellow" />} />
            <Caixa5 descricao="Suspensas" num={metricas.suspensas} icon={<Ban size={20} color="red" />} />
            <Caixa5 descricao="Receita total" num={Math.round(metricas.receitaTotal)} icon={<CreditCard size={20} color="blue" />} />
          </div>

          <div className="flex gap-1 bg-[#040928] border border-[#050e4c] rounded-lg p-1 w-fit mb-4 ml-4">
            <button onClick={() => setAba('licencas')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${aba === 'licencas' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              Licenças
            </button>
            <button onClick={() => setAba('pagamentos')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${aba === 'pagamentos' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              Pagamentos pendentes {pagamentosPendentes.length > 0 && `(${pagamentosPendentes.length})`}
            </button>
          </div>

          {erro && (
            <div className="mx-4 mb-4 p-3 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erro}</div>
          )}

          <div className="mx-4 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl overflow-auto">
            {carregando ? (
              <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
            ) : aba === 'licencas' ? (
              <table className="w-full text-left text-white border-collapse">
                <thead>
                  <tr className="text-gray-200 border-b-2 border-[#050e4c]">
                    <th className="py-3 px-4 text-sm font-light">Empresa</th>
                    <th className="py-3 px-4 text-sm font-light">Plano</th>
                    <th className="py-3 px-4 text-sm font-light">Status</th>
                    <th className="py-3 px-4 text-sm font-light">Expira em</th>
                    <th className="py-3 px-4 text-sm font-light">Dias restantes</th>
                    <th className="py-3 px-4 text-sm font-light text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {licencas.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Nenhuma licença encontrada.</td></tr>
                  ) : licencas.map((l) => (
                    <tr key={l.id} className="border-b border-[#050e4c] hover:bg-white/10 transition-colors">
                      <td className="py-3 px-4 text-sm">{l.empresa?.nome ?? '—'}</td>
                      <td className="py-3 px-4 text-sm">{l.plano}</td>
                      <td className={`py-3 px-4 text-sm font-medium ${corStatus(l.statusCalculado)}`}>{l.statusCalculado}</td>
                      <td className="py-3 px-4 text-sm">{new Date(l.expiraEm).toLocaleDateString('pt-PT')}</td>
                      <td className="py-3 px-4 text-sm">{Math.max(0, l.diasRestantes)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button title="Editar plano/validade" onClick={() => abrirEditar(l)} className="text-blue-400 hover:text-blue-300">
                            <Pencil size={16} />
                          </button>
                          <button
                            title={l.statusCalculado === 'Suspensa' ? 'Reativar' : 'Suspender'}
                            disabled={processando === l.id}
                            onClick={() => alternarSuspensao(l)}
                            className={l.statusCalculado === 'Suspensa' ? 'text-green-400 hover:text-green-300 disabled:opacity-50' : 'text-yellow-400 hover:text-yellow-300 disabled:opacity-50'}
                          >
                            {l.statusCalculado === 'Suspensa' ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-white border-collapse">
                <thead>
                  <tr className="text-gray-200 border-b-2 border-[#050e4c]">
                    <th className="py-3 px-4 text-sm font-light">Empresa</th>
                    <th className="py-3 px-4 text-sm font-light">Plano</th>
                    <th className="py-3 px-4 text-sm font-light">Valor</th>
                    <th className="py-3 px-4 text-sm font-light">Referência</th>
                    <th className="py-3 px-4 text-sm font-light">Data</th>
                    <th className="py-3 px-4 text-sm font-light text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentosPendentes.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Nenhum pagamento pendente.</td></tr>
                  ) : pagamentosPendentes.map((p) => (
                    <tr key={p.id} className="border-b border-[#050e4c] hover:bg-white/10 transition-colors">
                      <td className="py-3 px-4 text-sm">{p.empresa?.nome ?? '—'}</td>
                      <td className="py-3 px-4 text-sm">{p.licenca?.plano ?? '—'}</td>
                      <td className="py-3 px-4 text-sm">AOA {Number(p.valor).toLocaleString('pt-PT')},00</td>
                      <td className="py-3 px-4 text-sm">{p.referencia ?? '—'}</td>
                      <td className="py-3 px-4 text-sm">{new Date(p.criadoEm).toLocaleDateString('pt-PT')}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button disabled={processando === p.id} onClick={() => decidirPagamento(p.id, 'Concluido')}
                            className="text-green-400 hover:text-green-300 disabled:opacity-50 text-xs font-medium">
                            Aceitar
                          </button>
                          <button disabled={processando === p.id} onClick={() => decidirPagamento(p.id, 'Reembolsado')}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 text-xs font-medium">
                            Recusar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </Container>
      </Sidebar3>

      {/* Modal Editar Licença */}
      {modalEditar && licencaSel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Editar Licença — {licencaSel.empresa?.nome}</h2>
              <button onClick={() => setModalEditar(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Plano</label>
                <select
                  value={formEditar.plano}
                  onChange={(e) => setFormEditar((p) => ({ ...p, plano: e.target.value }))}
                  className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500"
                >
                  <option value="Basico">Básico</option>
                  <option value="Profissional">Profissional</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Expira em</label>
                <input
                  type="date"
                  value={formEditar.expiraEm}
                  onChange={(e) => setFormEditar((p) => ({ ...p, expiraEm: e.target.value }))}
                  className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500"
                />
              </div>
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
    </div>
  )
}
