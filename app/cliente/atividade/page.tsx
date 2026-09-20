'use client'
import { useEffect, useState, useCallback } from "react"
import Cookies from "js-cookie"
import Container from "@/components/container"
import Sidebar2 from "@/components/sidbar2"
import { Bell, History } from "lucide-react"
import { useUsuarioNome } from "@/hooks/useUsuarioNome"
import { logService } from "@/services"
import type { Log } from "@/services"

function humanizarAcao(acao: string): string {
  if (acao === 'LOGIN') return 'Início de sessão'
  const [metodo, caminho] = acao.split(' ')
  const recurso = (caminho ?? '').replace('/api/v1/', '').split('/').filter(Boolean)[0] ?? 'sistema'
  const verbos: Record<string, string> = { POST: 'Criação em', PATCH: 'Atualização em', DELETE: 'Remoção em', GET: 'Consulta em' }
  return `${verbos[metodo] ?? 'Ação em'} ${recurso}`
}

export default function AtividadeCliente() {
  const nomeUsuario = useUsuarioNome()
  const [empresaId, setEmpresaId] = useState('')
  const [logs, setLogs] = useState<Log[]>([])
  const [carregando, setCarregando] = useState(true)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  useEffect(() => {
    try {
      const u = JSON.parse(Cookies.get('usuario') ?? '{}')
      setEmpresaId(u.empresaId ?? '')
    } catch { /* ignora */ }
  }, [])

  const carregar = useCallback(async () => {
    if (!empresaId) return
    try {
      setCarregando(true)
      const params: Record<string, unknown> = { empresaId, page: paginaAtual, limit: 15 }
      if (dataInicio) params.dataInicio = dataInicio
      if (dataFim) params.dataFim = dataFim
      const res = await logService.listar(params)
      setLogs(res.data.data ?? [])
      setTotalPaginas(res.data.meta?.totalPages ?? 1)
    } catch { /* ignora */ } finally {
      setCarregando(false)
    }
  }, [empresaId, paginaAtual, dataInicio, dataFim])

  useEffect(() => { carregar() }, [carregar])

  const dataHoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <Sidebar2>
        <Container titulo="Actividade" notificacao={<Bell size={20} />} usuario={nomeUsuario || dataHoje}>
          <div className="w-[1180px] ml-3 mt-2 flex flex-col gap-4">

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-xs">De</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => { setDataInicio(e.target.value); setPaginaAtual(1) }}
                  className="bg-[#040928] text-white border border-[#050e4c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 text-xs">Até</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => { setDataFim(e.target.value); setPaginaAtual(1) }}
                  className="bg-[#040928] text-white border border-[#050e4c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              {(dataInicio || dataFim) && (
                <button
                  onClick={() => { setDataInicio(''); setDataFim(''); setPaginaAtual(1) }}
                  className="self-end mb-0.5 text-gray-400 hover:text-white text-xs underline"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="bg-[#040928] rounded-2xl shadow-xl border border-[#050e4c] p-4">
              <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <History size={20} className="text-gray-400" />
                Histórico de Actividade
              </h2>

              {carregando ? (
                <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
              ) : logs.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Nenhuma actividade encontrada.</p>
              ) : (
                <div className="w-full">
                  <div className="grid grid-cols-2 text-gray-400 text-sm font-medium mb-2 px-1">
                    <span>Descrição</span>
                    <span>Data</span>
                  </div>
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="grid grid-cols-2 items-start border-b border-gray-700 pb-2">
                        <span className="text-white text-sm font-light flex items-center gap-2">
                          <span>✅</span>
                          {humanizarAcao(log.acao)}
                        </span>
                        <span className="text-gray-400 text-sm font-light">
                          {new Date(log.criadoEm).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
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
    </div>
  )
}
