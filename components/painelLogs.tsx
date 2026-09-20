'use client'
import { useEffect, useState, useCallback } from "react"
import { History, Search } from "lucide-react"
import { logService } from "@/services"
import type { Log } from "@/services"

function humanizarAcao(acao: string): string {
  if (acao === 'LOGIN') return 'Início de sessão'
  const [metodo, caminho] = acao.split(' ')
  const recurso = (caminho ?? '').replace('/api/v1/', '').split('/').filter(Boolean)[0] ?? 'sistema'
  const verbos: Record<string, string> = { POST: 'Criação em', PATCH: 'Atualização em', DELETE: 'Remoção em', GET: 'Consulta em' }
  return `${verbos[metodo] ?? 'Ação em'} ${recurso}`
}

function corPapel(papel?: string) {
  if (papel === 'ADM') return 'bg-purple-600/20 text-purple-400'
  if (papel === 'Operacional') return 'bg-blue-600/20 text-blue-400'
  return 'bg-teal-600/20 text-teal-400'
}

export default function PainelLogs() {
  const [logs, setLogs] = useState<Log[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistos, setTotalRegistos] = useState(0)

  const [pesquisa, setPesquisa] = useState('')
  const [filtroPapel, setFiltroPapel] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const [logDetalhe, setLogDetalhe] = useState<Log | null>(null)

  const carregar = useCallback(async () => {
    try {
      setCarregando(true)
      const params: Record<string, unknown> = { page: paginaAtual, limit: 20 }
      if (pesquisa)    params.acao = pesquisa
      if (filtroPapel) params.papel = filtroPapel
      if (dataInicio)  params.dataInicio = dataInicio
      if (dataFim)     params.dataFim = dataFim

      const res = await logService.listar(params)
      setLogs(res.data.data ?? [])
      setTotalPaginas(res.data.meta?.totalPages ?? 1)
      setTotalRegistos(res.data.meta?.total ?? 0)
      setErro('')
    } catch {
      setErro('Erro ao carregar logs.')
    } finally {
      setCarregando(false)
    }
  }, [paginaAtual, pesquisa, filtroPapel, dataInicio, dataFim])

  useEffect(() => {
    const timer = setTimeout(carregar, 300)
    return () => clearTimeout(timer)
  }, [carregar])

  return (
    <div className="w-full flex flex-col gap-4">

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="pesquisar por ação (ex: funcionarios, empresas...)"
            value={pesquisa}
            onChange={(e) => { setPesquisa(e.target.value); setPaginaAtual(1) }}
            className="w-[280px] bg-[#040928] text-white border border-[#050e4c] rounded-lg pl-9 pr-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={filtroPapel}
          onChange={(e) => { setFiltroPapel(e.target.value); setPaginaAtual(1) }}
          className="bg-[#040928] text-white border border-[#050e4c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos os papéis</option>
          <option value="ADM">ADM</option>
          <option value="Operacional">Operacional</option>
          <option value="Cliente">Cliente</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-xs">De</label>
          <input type="date" value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setPaginaAtual(1) }}
            className="bg-[#040928] text-white border border-[#050e4c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          <label className="text-gray-400 text-xs">Até</label>
          <input type="date" value={dataFim} onChange={(e) => { setDataFim(e.target.value); setPaginaAtual(1) }}
            className="bg-[#040928] text-white border border-[#050e4c] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>

        {(pesquisa || filtroPapel || dataInicio || dataFim) && (
          <button
            onClick={() => { setPesquisa(''); setFiltroPapel(''); setDataInicio(''); setDataFim(''); setPaginaAtual(1) }}
            className="text-gray-400 hover:text-white text-xs underline"
          >
            Limpar filtros
          </button>
        )}

        <span className="text-gray-500 text-xs ml-auto">{totalRegistos} registo(s)</span>
      </div>

      {erro && (
        <div className="p-3 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erro}</div>
      )}

      <div className="bg-[#040928] border border-[#050e4c] rounded-2xl overflow-auto">
        {carregando ? (
          <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
        ) : (
          <table className="w-full text-left text-white border-collapse">
            <thead>
              <tr className="text-gray-200 border-b-2 border-[#050e4c]">
                <th className="py-3 px-4 text-sm font-light">Data/Hora</th>
                <th className="py-3 px-4 text-sm font-light">Utilizador</th>
                <th className="py-3 px-4 text-sm font-light">Papel</th>
                <th className="py-3 px-4 text-sm font-light">Empresa</th>
                <th className="py-3 px-4 text-sm font-light">Ação</th>
                <th className="py-3 px-4 text-sm font-light">Estado</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Nenhum registo encontrado.</td></tr>
              ) : logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setLogDetalhe(log)}
                  className="border-b border-[#050e4c] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-sm whitespace-nowrap">
                    {new Date(log.criadoEm).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    <span className="text-gray-500 ml-1">
                      {new Date(log.criadoEm).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <p className="text-white">{log.usuario?.nome ?? '—'}</p>
                    <p className="text-gray-500 text-xs">{log.usuario?.email ?? ''}</p>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${corPapel(log.usuario?.papel)}`}>{log.usuario?.papel ?? '—'}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">{log.empresa?.nome ?? '—'}</td>
                  <td className="py-3 px-4 text-sm" title={log.acao}>{humanizarAcao(log.acao)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={(log.statusHttp ?? 200) < 400 ? 'text-green-400' : 'text-red-400'}>
                      {log.statusHttp ?? '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPaginaAtual(p)}
              className={`w-8 h-8 rounded-lg text-sm ${p === paginaAtual ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal detalhe do log */}
      {logDetalhe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setLogDetalhe(null)}>
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <History size={20} className="text-gray-400" />
              Detalhes do registo
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <p><span className="text-gray-400">Utilizador:</span> <span className="text-white">{logDetalhe.usuario?.nome ?? '—'} ({logDetalhe.usuario?.email ?? '—'})</span></p>
              <p><span className="text-gray-400">Papel:</span> <span className="text-white">{logDetalhe.usuario?.papel ?? '—'}</span></p>
              <p><span className="text-gray-400">Empresa:</span> <span className="text-white">{logDetalhe.empresa?.nome ?? '—'}</span></p>
              <p><span className="text-gray-400">Ação:</span> <span className="text-white">{logDetalhe.acao}</span></p>
              <p><span className="text-gray-400">Data/Hora:</span> <span className="text-white">{new Date(logDetalhe.criadoEm).toLocaleString('pt-PT')}</span></p>
              <p><span className="text-gray-400">Estado HTTP:</span> <span className={(logDetalhe.statusHttp ?? 200) < 400 ? 'text-green-400' : 'text-red-400'}>{logDetalhe.statusHttp ?? '—'}</span></p>
              <p><span className="text-gray-400">IP:</span> <span className="text-white">{logDetalhe.ip ?? '—'}</span></p>
              <p className="break-all"><span className="text-gray-400">User-agent:</span> <span className="text-white text-xs">{logDetalhe.userAgent ?? '—'}</span></p>
            </div>
            <button onClick={() => setLogDetalhe(null)}
              className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
