'use client'

import { useEffect, useState } from "react"
import AtividadesFuncionario from "@/components/actividadeFun"
import UltimosAlertas from "@/components/alerta"
import BalancoMetodosPagamento from "@/components/balanco"
import Caixa5 from "@/components/caixa5"
import Container from "@/components/container"
import Sidebar2 from "@/components/sidbar2"
import Tabela5, { Atividade } from "@/components/tabela5"
import { Bell, Calendar, Layers, Users2 } from "lucide-react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

interface Cards {
  equipamentos:   number
  funcionarios:   number
  diasLicenca:    number
  alertas:        number
}

interface DadosGrafico {
  dia:        string
  acessos:    number
  acoes:      number
  tentativas: number
}

interface AlertaItem {
  titulo: string
  data:   string
}

interface MetodoPagamento {
  nome:       string
  percentual: number
  cor:        string
}

export default function Dashboard() {
  const [cards,       setCards]       = useState<Cards>({ equipamentos: 0, funcionarios: 0, diasLicenca: 0, alertas: 0 })
  const [grafico,     setGrafico]     = useState<DadosGrafico[]>([])
  const [alertas,     setAlertas]     = useState<AlertaItem[]>([])
  const [funcionarios, setFuncionarios] = useState<Atividade[]>([])
  const [pagamentos,  setPagamentos]  = useState<MetodoPagamento[]>([])
  const [totalPag,    setTotalPag]    = useState(0)
  const [carregando,  setCarregando]  = useState(true)
  const [nomeUsuario, setNomeUsuario] = useState('')

  useEffect(() => {
    const usuarioRaw = Cookies.get('usuario')
    if (!usuarioRaw) return

    let usuario: any
    try { usuario = JSON.parse(usuarioRaw) } catch { return }

    setNomeUsuario(usuario.nome ?? '')
    const empresaId = usuario.empresaId
    if (!empresaId) return

    async function carregar() {
      try {
        const [
          resEquip, resFun, resLic, resAlertaResumo,
          resAlertas, resLogs, resPag,
        ] = await Promise.allSettled([
          api.get('/equipamentos', { params: { empresaId, limit: 1 } }),
          api.get('/funcionarios',  { params: { empresaId, limit: 1 } }),
          api.get('/licencas',      { params: { empresaId, limit: 1 } }),
          api.get('/alertas/resumo',{ params: { empresaId } }),
          api.get('/alertas',       { params: { empresaId, limit: 5, lido: 'false' } }),
          api.get('/logs',          { params: { empresaId, limit: 200 } }),
          api.get('/pagamentos',    { params: { empresaId, limit: 100 } }),
        ])

        // Cards
        const totalEquip  = resEquip.status  === 'fulfilled' ? resEquip.value?.data?.meta?.total  ?? 0 : 0
        const totalFun    = resFun.status    === 'fulfilled' ? resFun.value?.data?.meta?.total    ?? 0 : 0
        const totalAlerta = resAlertaResumo.status === 'fulfilled' ? resAlertaResumo.value?.data?.data?.total ?? 0 : 0

        // Dias restantes da licença
        let diasLicenca = 0
        if (resLic.status === 'fulfilled') {
          const licencas = resLic.value?.data?.data ?? []
          if (licencas.length > 0) {
            const expira = new Date(licencas[0].expiraEm)
            const hoje   = new Date()
            diasLicenca  = Math.max(0, Math.ceil((expira.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)))
          }
        }

        setCards({ equipamentos: totalEquip, funcionarios: totalFun, diasLicenca, alertas: totalAlerta })

        // Últimos alertas
        if (resAlertas.status === 'fulfilled') {
          const lista = resAlertas.value?.data?.data ?? []
          setAlertas(lista.map((a: any) => ({
            titulo: a.descricao,
            data:   new Date(a.criadoEm).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
          })))
        }

        // Gráfico de actividades (logs últimos 7 dias)
        if (resLogs.status === 'fulfilled') {
          const logs  = resLogs.value?.data?.data ?? []
          const hoje  = new Date()
          const semana: DadosGrafico[] = []

          for (let i = 6; i >= 0; i--) {
            const d = new Date(hoje)
            d.setDate(hoje.getDate() - i)

            const diario: DadosGrafico = { dia: DIAS[d.getDay()], acessos: 0, acoes: 0, tentativas: 0 }

            logs.forEach((log: any) => {
              const ld = new Date(log.criadoEm)
              if (ld.toDateString() !== d.toDateString()) return
              if (log.acao?.startsWith('POST /api/v1/auth')) {
                if (log.statusHttp === 401) diario.tentativas++
                else diario.acessos++
              } else {
                diario.acoes++
              }
            })
            semana.push(diario)
          }
          setGrafico(semana)
        }

        // Funcionários recentes
        if (resFun.status === 'fulfilled') {
          const resFunLista = await api.get('/funcionarios', { params: { empresaId, limit: 5 } })
          const lista = resFunLista?.data?.data ?? []
          setFuncionarios(lista.map((f: any) => ({
            funcionario:  f.nome,
            status:       f.status === 'Ativo' ? 'Ativo' : 'Inativo',
            ultimoAcesso: new Date(f.updatedAt ?? f.criadoEm).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
          })))
        }

        // Balanço de pagamentos
        if (resPag.status === 'fulfilled') {
          const lista = resPag.value?.data?.data ?? []
          const total = lista.length

          if (total > 0) {
            const conc = lista.filter((p: any) => p.status === 'Concluido').length
            const pend = lista.filter((p: any) => p.status === 'Pendente').length
            const remb = lista.filter((p: any) => p.status === 'Reembolsado').length
            const pct  = (n: number) => Math.round((n / total) * 100)

            setPagamentos([
              { nome: 'Concluídos',   percentual: pct(conc), cor: '#10B981' },
              { nome: 'Pendentes',    percentual: pct(pend), cor: '#F59E0B' },
              { nome: 'Reembolsados', percentual: pct(remb), cor: '#EF4444' },
            ])
            setTotalPag(pct(conc))
          }
        }

      } catch (err) {
        console.error('Erro dashboard cliente:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [])

  const dataHoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <Sidebar2>
        <Container titulo="Dashboard" notificacao={<Bell size={20} />} usuario={nomeUsuario || dataHoje}>

          {carregando ? (
            <div className="flex items-center justify-center h-64 text-gray-400">A carregar...</div>
          ) : (
            <>
              {/* Cards superiores */}
              <div className="flex justify-around mb-4">
                <Caixa5 descricao="Equipamentos monitorados" num={cards.equipamentos} icon={<Layers  size={20} color="green" />} />
                <Caixa5 descricao="Funcionários"             num={cards.funcionarios}  icon={<Users2  size={20} color="blue" />} />
                <Caixa5 descricao="Dias restantes da Licença" num={cards.diasLicenca} icon={<Calendar size={20} color="yellow" />} />
                <Caixa5 descricao="Alertas"                  num={cards.alertas}       icon={<Bell    size={20} color="pink" />} />
              </div>

              {/* Primeira linha */}
              <div className="flex gap-3 mb-3">
                <div className="w-212.5 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl">
                  <AtividadesFuncionario dados={grafico} />
                </div>
                <div className="w-125 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl">
                  <UltimosAlertas alertas={alertas} />
                </div>
              </div>

              {/* Segunda linha */}
              <div className="flex gap-3">
                <div className="w-225 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl">
                  <BalancoMetodosPagamento dados={pagamentos} total={totalPag} />
                </div>
                <div className="w-142.5 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl">
                  <h2 className="text-white text-xl font-regular mb-4 mt-4 ml-4">Funcionários</h2>
                  <Tabela5 dados={funcionarios} />
                </div>
              </div>
            </>
          )}

        </Container>
      </Sidebar2>
    </div>
  )
}