'use client'
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Container from "@/components/container"
import HistoricoPagamentos from "@/components/historicoPagamento"
import LicencaAtiva from "@/components/licencaAtiva"
import PagarLicenca from "@/components/pagarLi"
import Sidebar2 from "@/components/sidbar2"
import Tabela7, { Pagamento } from "@/components/tabela7"
import { Bell } from "lucide-react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"
import jsPDF from "jspdf"
import { useUsuarioPermissoes } from "@/hooks/useUsuarioPermissoes"

interface LicencaAPI {
  id:               string
  plano:            string
  status:           string
  statusCalculado:  'Ativa' | 'Expirada' | 'Suspensa'
  expiraEm:         string
  inicioEm:         string
  maxDeFuncionarios: number
}

const PLANO_PRECOS: Record<string, number> = {
  Basico:       40000,
  Profissional: 240000,
  Premium:      480000,
}

interface PagamentoAPI {
  id:        string
  valor:     number
  moeda:     string
  status:    'Pendente' | 'Concluido' | 'Reembolsado'
  referencia: string | null
  criadoEm:  string
  licenca:   { id: string; plano: string }
}

function gerarReciboPDF(p: PagamentoAPI) {
  const doc  = new jsPDF()
  const num  = `REC-${p.id.slice(0, 8).toUpperCase()}`
  const data = new Date(p.criadoEm).toLocaleDateString('pt-PT')

  doc.setFillColor(4, 9, 40)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('KITUXI TECH — VAR', 14, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Recibo Nº: ${num}`, 14, 28)
  doc.text(`Data: ${data}`, 150, 28)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DETALHES DO PAGAMENTO', 14, 55)

  doc.setFillColor(4, 9, 40)
  doc.rect(14, 60, 182, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text('Plano', 16, 67)
  doc.text('Valor', 100, 67)
  doc.text('Status', 150, 67)

  doc.setFillColor(240, 242, 255)
  doc.rect(14, 70, 182, 12, 'F')
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text(p.licenca?.plano ?? '—', 16, 78)
  doc.text(`AOA ${Number(p.valor).toLocaleString('pt-PT')},00`, 100, 78)
  doc.text(p.status === 'Concluido' ? 'Pago' : p.status, 150, 78)

  if (p.referencia) {
    doc.setFontSize(10)
    doc.text(`Referência: ${p.referencia}`, 14, 100)
  }

  doc.setTextColor(150, 150, 150)
  doc.setFontSize(8)
  doc.line(14, 270, 196, 270)
  doc.text(`Documento gerado em ${new Date().toLocaleDateString('pt-PT')} | ${num}`, 14, 276)

  doc.save(`recibo_${num}.pdf`)
}

export default function Dashboard() {
  const router = useRouter()
  const { permissaoGestao } = useUsuarioPermissoes()

  useEffect(() => {
    if (!permissaoGestao) router.replace('/cliente/dashboard')
  }, [permissaoGestao, router])

  const [mostrarPagar, setMostrarPagar] = useState(false)
  const [licenca,      setLicenca]      = useState<LicencaAPI | null>(null)
  const [pagamentos,   setPagamentos]   = useState<PagamentoAPI[]>([])
  const [carregando,   setCarregando]   = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')
  const [empresaId,    setEmpresaId]    = useState('')
  const [nomeUsuario,  setNomeUsuario]  = useState('')
  const [paginaAtual,  setPaginaAtual]  = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  useEffect(() => {
    try {
      const u = JSON.parse(Cookies.get('usuario') ?? '{}')
      setEmpresaId(u.empresaId ?? '')
      setNomeUsuario(u.nome ?? '')
    } catch { /* ignora */ }
  }, [])

  const carregar = useCallback(async () => {
    if (!empresaId) return
    try {
      setCarregando(true)
      const params: any = { empresaId, page: paginaAtual, limit: 10 }
      if (filtroStatus) params.status = filtroStatus
      if (filtroMetodo) params.search = filtroMetodo

      const [resLic, resPag] = await Promise.allSettled([
        api.get('/licencas',   { params: { empresaId, limit: 1, orderBy: 'expiraEm' } }),
        api.get('/pagamentos', { params }),
      ])

      if (resLic.status === 'fulfilled') {
        const lista = resLic.value?.data?.data ?? []
        if (lista.length > 0) setLicenca(lista[0])
      }

      if (resPag.status === 'fulfilled') {
        setPagamentos(resPag.value?.data?.data ?? [])
        setTotalPaginas(resPag.value?.data?.meta?.totalPages ?? 1)
      }
    } catch (err) {
      console.error('Erro ao carregar:', err)
    } finally {
      setCarregando(false)
    }
  }, [empresaId, paginaAtual, filtroStatus, filtroMetodo])

  useEffect(() => { carregar() }, [carregar])

  const exportarTodos = () => {
    pagamentos.forEach((p) => gerarReciboPDF(p))
  }

  const diasRestantes = licenca
    ? Math.max(0, Math.ceil((new Date(licenca.expiraEm).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const inicioPeriodo = (chave: string): Date | null => {
    const hoje = new Date()
    const inicio = new Date(hoje)
    inicio.setHours(0, 0, 0, 0)
    if (chave === 'hoje') return inicio
    if (chave === 'ontem') { inicio.setDate(inicio.getDate() - 1); return inicio }
    if (chave === 'esta-semana') { inicio.setDate(inicio.getDate() - 7); return inicio }
    if (chave === 'este-mes') { inicio.setMonth(inicio.getMonth() - 1); return inicio }
    if (chave === 'este-ano') { inicio.setFullYear(inicio.getFullYear() - 1); return inicio }
    return null
  }

  const pagamentosFiltrados = filtroPeriodo
    ? pagamentos.filter((p) => {
        const desde = inicioPeriodo(filtroPeriodo)
        if (!desde) return true
        const data = new Date(p.criadoEm)
        if (filtroPeriodo === 'ontem') {
          const ateOntem = new Date(desde)
          ateOntem.setDate(ateOntem.getDate() + 1)
          return data >= desde && data < ateOntem
        }
        return data >= desde
      })
    : pagamentos

  const dadosTabela: Pagamento[] = pagamentosFiltrados.map((p) => ({
    id:           p.id,
    data:         new Date(p.criadoEm).toLocaleDateString('pt-PT'),
    valor:        `AOA ${Number(p.valor).toLocaleString('pt-PT')},00`,
    chaveLicenca: p.id.slice(0, 8).toUpperCase(),
    metodo:       p.referencia ?? '—',
    status:       p.status === 'Concluido' ? 'Pago' : p.status === 'Reembolsado' ? 'Reembolsado' : 'Pendente',
    onBaixarPDF:  () => gerarReciboPDF(p),
  }))

  const dataHoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <Sidebar2>
        <Container
          titulo={mostrarPagar ? "Pagamentos & licenças > Escolher & pagar Licença" : "Pagamentos & licenças"}
          notificacao={<Bell size={20} />}
          usuario={nomeUsuario || dataHoje}
        >
          {mostrarPagar ? (
            <div className="w-[1180px] ml-3 mt-2">
              <PagarLicenca
                empresaId={empresaId}
                onVoltar={() => { setMostrarPagar(false); carregar() }}
              />
            </div>
          ) : (
            <>
              <div className="w-[1180px] ml-3 mt-2 flex flex-col gap-3">
                {carregando ? (
                  <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
                ) : (
                  <LicencaAtiva
                    plano={licenca?.plano ?? '—'}
                    dataExpiracao={licenca ? new Date(licenca.expiraEm).toLocaleDateString('pt-PT') : '—'}
                    diasRestantes={diasRestantes}
                    status={licenca?.statusCalculado ?? 'Ativa'}
                    onPagar={() => setMostrarPagar(true)}
                    onRenovado={carregar}
                    empresaId={empresaId}
                    precoBase={PLANO_PRECOS[licenca?.plano ?? ''] ?? PLANO_PRECOS.Profissional}
                  />
                )}

                <HistoricoPagamentos
                  onFiltrarStatus={(s) => { setFiltroStatus(s); setPaginaAtual(1) }}
                  onFiltrarPeriodo={setFiltroPeriodo}
                  onFiltrarMetodo={(m) => { setFiltroMetodo(m); setPaginaAtual(1) }}
                  onExportar={exportarTodos}
                />
              </div>

              <div className="w-[1180px] ml-3 mt-1 flex flex-col gap-3 border-[#050e4c] border rounded-2xl p-4 shadow-xl bg-[#040928]">
                {carregando ? (
                  <p className="text-gray-400 text-sm text-center py-4">A carregar...</p>
                ) : (
                  <Tabela7 dados={dadosTabela} />
                )}

                {totalPaginas > 1 && (
                  <div className="flex justify-center gap-2 mt-2">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                      <button key={p} onClick={() => setPaginaAtual(p)}
                        className={`w-8 h-8 rounded-lg text-sm ${p === paginaAtual ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Container>
      </Sidebar2>
    </div>
  )
}