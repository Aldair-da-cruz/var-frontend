'use client'

import { useEffect, useState, useCallback } from "react"
import Caixa4 from "@/components/caixa4"
import Container from "@/components/container"
import Sidebar from "@/components/sidebar"
import Tabela4, { TabelaResumo4 } from "@/components/tabela4"
import { Bell, Search, FileText, File, FileCheck, Plus, X, Upload } from "lucide-react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api\/v1\/?$/, '')

interface Documento {
  id:          string
  nomeArquivo: string
  caminho:     string
  status:      'NaoLido' | 'Lido' | 'Arquivado'
  criadoEm:    string
  empresa:     { id: string; nome: string }
  responsavel: { id: string; nome: string } | null
}

interface Empresa {
  id:   string
  nome: string
}

export default function Home() {
  const [documentos,   setDocumentos]   = useState<Documento[]>([])
  const [resumo,       setResumo]       = useState({ lidos: 0, naoLidos: 0, arquivados: 0 })
  const [search,       setSearch]       = useState('')
  const [carregando,   setCarregando]   = useState(true)
  const [paginaAtual,  setPaginaAtual]  = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  // Modal de upload
  const [modalUpload,    setModalUpload]    = useState(false)
  const [empresas,       setEmpresas]       = useState<Empresa[]>([])
  const [empresaSel,     setEmpresaSel]     = useState('')
  const [arquivo,        setArquivo]        = useState<File | null>(null)
  const [loadingUpload,  setLoadingUpload]  = useState(false)
  const [erroUpload,     setErroUpload]     = useState('')

  const [nomeUsuario, setNomeUsuario] = useState('ADM')

  useEffect(() => {
    try { setNomeUsuario(JSON.parse(Cookies.get('usuario') ?? '{}').nome ?? 'ADM') } catch { /* ignora */ }
  }, [])

  const carregarDocumentos = useCallback(async () => {
    try {
      setCarregando(true)
      const res = await api.get('/documentos', {
        params: { page: paginaAtual, limit: 10, search: search || undefined },
      })
      setDocumentos(res.data.data)
      setTotalPaginas(res.data.meta.totalPages)

      const resResumo = await api.get('/documentos/resumo')
      setResumo(resResumo.data.data)
    } catch (err) {
      console.error('Erro ao carregar documentos:', err)
    } finally {
      setCarregando(false)
    }
  }, [paginaAtual, search])

  useEffect(() => {
    const timer = setTimeout(carregarDocumentos, 300)
    return () => clearTimeout(timer)
  }, [carregarDocumentos])

  const abrirModalUpload = async () => {
    setErroUpload('')
    setArquivo(null)
    setEmpresaSel('')
    setModalUpload(true)
    try {
      const res = await api.get('/empresas', { params: { limit: 100 } })
      setEmpresas(res.data.data)
    } catch {
      setErroUpload('Erro ao carregar lista de empresas.')
    }
  }

  const handleUpload = async () => {
    if (!empresaSel || !arquivo) {
      setErroUpload('Selecciona a empresa e o ficheiro.')
      return
    }
    try {
      setLoadingUpload(true)
      const formData = new FormData()
      formData.append('empresaId', empresaSel)
      formData.append('arquivo', arquivo)

      await api.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setModalUpload(false)
      carregarDocumentos()
    } catch (err: any) {
      setErroUpload(err?.response?.data?.message ?? 'Erro ao enviar documento.')
    } finally {
      setLoadingUpload(false)
    }
  }

  const marcarLido = async (id: string) => {
    try { await api.patch(`/documentos/${id}/lido`); carregarDocumentos() } catch { /* ignora */ }
  }

  const arquivarDoc = async (id: string) => {
    try { await api.patch(`/documentos/${id}/arquivar`); carregarDocumentos() } catch { /* ignora */ }
  }

  const eliminarDoc = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este documento?')) return
    try { await api.delete(`/documentos/${id}`); carregarDocumentos() } catch { /* ignora */ }
  }

  const exportarTodos = () => {
    const linhas = [
      ['Responsável', 'Empresa', 'Comprovativo', 'Status', 'Data'].join(','),
      ...documentos.map((d) => [
        d.responsavel?.nome ?? '-',
        d.empresa.nome,
        d.nomeArquivo,
        d.status,
        new Date(d.criadoEm).toLocaleDateString('pt-PT'),
      ].join(',')),
    ].join('\n')

    const blob = new Blob([linhas], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `documentos_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const caixasData3 = [
    { icon: <File      size={24} />, num: resumo.naoLidos,   descricao: "Documentos não lidos" },
    { icon: <FileText  size={24} />, num: resumo.lidos,      descricao: "Documentos lidos" },
    { icon: <FileCheck size={24} />, num: resumo.arquivados, descricao: "Documentos arquivados" },
  ]

  const dadosTabela: TabelaResumo4[] = documentos.map((d) => ({
    id:           d.id,
    responsavel:  d.responsavel?.nome ?? '—',
    empresa:      d.empresa.nome,
    comprovativo: d.nomeArquivo,
    status:       d.status,
    urlArquivo:   `${API_ORIGIN}${d.caminho}`,
    onMarcarLido: () => marcarLido(d.id),
    onArquivar:   () => arquivarDoc(d.id),
    onEliminar:   () => eliminarDoc(d.id),
  }))

  return (
    <>
      <Sidebar>
        <Container titulo="Documentos" notificacao={<Bell size={20} />} usuario={nomeUsuario}>

          <div className="flex w-full justify-center items-center gap-3 mb-4">
            {caixasData3.map((item, index) => (
              <Caixa4 key={index} icon={item.icon} num={item.num} descricao={item.descricao} />
            ))}
          </div>

          <div className="flex justify-between w-full mb-4 items-center">
            <button
              onClick={abrirModalUpload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Adicionar documento
            </button>

            <div className="w-[300px]">
              <div className="bg-[#040928] text-white h-10 flex items-center gap-3 border border-[#050e4c] rounded-lg">
                <Search size={18} className="ml-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPaginaAtual(1) }}
                  className="outline-none placeholder:text-gray-500 h-10 w-full bg-transparent text-sm text-white"
                />
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="p-4 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl">
              {carregando ? (
                <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <Tabela4 dados={dadosTabela} onExportarTodos={exportarTodos} />
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

      {/* Modal Upload */}
      {modalUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Adicionar documento</h2>
              <button onClick={() => setModalUpload(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {erroUpload && (
              <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroUpload}</div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Empresa</label>
                <select
                  value={empresaSel}
                  onChange={(e) => setEmpresaSel(e.target.value)}
                  className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500"
                >
                  <option value="">Selecciona a empresa</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Ficheiro (PDF, JPG, PNG — máx. 10MB)</label>
                <label className="flex items-center gap-2 py-2.5 px-4 border border-dashed border-[#050e4c] rounded-lg bg-[#03031b] text-gray-400 text-sm cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload size={16} />
                  {arquivo ? arquivo.name : 'Clica para escolher o ficheiro'}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleUpload} disabled={loadingUpload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {loadingUpload ? 'A enviar...' : 'Enviar'}
              </button>
              <button onClick={() => setModalUpload(false)}
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