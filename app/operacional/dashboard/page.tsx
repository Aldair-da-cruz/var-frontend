'use client'

import { useEffect, useState } from "react"
import AtividadesFuncionario2 from "@/components/actividadeFun2"
import AtividadesRecentes from "@/components/actividadeRec2"
import Caixa5 from "@/components/caixa5"
import Container from "@/components/container"
import EquipeOnline from "@/components/equipaOline"
import Sidebar3 from "@/components/sidbar3"
import { AlertCircle, AlertTriangle, Bell, MapPin, UserCheck } from "lucide-react"

import { alertaService, funcionarioService, equipamentoService, logService, usuarioService } from "@/services"
import { useUsuarioNome } from "@/hooks/useUsuarioNome"

function humanizarAcao(acao: string): string {
  const [metodo, caminho] = acao.split(' ')
  const recurso = (caminho ?? '').replace('/api/v1/', '').split('/').filter(Boolean)[0] ?? 'sistema'
  const verbos: Record<string, string> = { POST: 'Criação em', PATCH: 'Atualização em', DELETE: 'Remoção em', GET: 'Consulta em' }
  return `${verbos[metodo] ?? 'Ação em'} ${recurso}`
}

function formatarHora(dataIso: string): string {
  const data = new Date(dataIso)
  const hoje = new Date()
  const mesmodia = data.toDateString() === hoje.toDateString()
  const hora = data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  return mesmodia ? `Hoje - ${hora}` : `${data.toLocaleDateString('pt-PT')} - ${hora}`
}

interface DadosGrafico {
  dia: string
  alertas: number
  acoes: number
  logins: number
}

interface ResumoCards {
  funcionariosAtivos: number
  locaisMonitorados: number
  falhas: number
  alertas: number
}

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function agruparLogsPorDia(logs: any[]): DadosGrafico[] {
  const hoje = new Date()
  const semana: DadosGrafico[] = []

  for (let i = 6; i >= 0; i--) {
    const data = new Date(hoje)
    data.setDate(hoje.getDate() - i)

    const diario: DadosGrafico = {
      dia: DIAS[data.getDay()],
      alertas: 0,
      acoes: 0,
      logins: 0,
    }

    logs.forEach((log) => {
      const logData = new Date(log.criadoEm)

      const sameDay =
        logData.getDate() === data.getDate() &&
        logData.getMonth() === data.getMonth() &&
        logData.getFullYear() === data.getFullYear()

      if (!sameDay) return

      if (log.acao?.includes("/alertas") && log.acao?.startsWith("POST")) {
        diario.alertas++
      } else {
        diario.acoes++
      }
    })

    semana.push(diario)
  }

  return semana
}

export default function Dashboard() {
  const [cards, setCards] = useState<ResumoCards>({
    funcionariosAtivos: 0,
    locaisMonitorados: 0,
    falhas: 0,
    alertas: 0,
  })

  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [membrosOnline, setMembrosOnline] = useState<{ nome: string; atividade: 'Em campo' | 'Monitoramento' }[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [atividades, setAtividades] = useState<any[]>([])
  const nomeUsuario = useUsuarioNome()

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resumoAlertas, funcionarios, equipamentos, logs, online] =
          await Promise.allSettled([
            alertaService.resumo(),
            funcionarioService.listar({ status: "Ativo", limit: 1 }),
            equipamentoService.listar({ limit: 1 }),
            logService.listar({ limit: 200 }),
            usuarioService.online(),
          ])

        // ALERTAS
        const totalAlertas =
          resumoAlertas.status === "fulfilled"
            ? resumoAlertas.value?.data?.data?.total ?? 0
            : 0

        const totalFalhas =
          resumoAlertas.status === "fulfilled"
            ? resumoAlertas.value?.data?.data?.porNivel?.critico ?? 0
            : 0

        // FUNCIONÁRIOS
        const totalFuncionarios =
          funcionarios.status === "fulfilled"
            ? (Array.isArray(funcionarios.value?.data?.data)
                ? funcionarios.value.data.data.length
                : 0)
            : 0

        // EQUIPAMENTOS
        const totalLocais =
          equipamentos.status === "fulfilled"
            ? (Array.isArray(equipamentos.value?.data?.data)
                ? equipamentos.value.data.data.length
                : 0)
            : 0

        setCards({
          funcionariosAtivos: totalFuncionarios,
          locaisMonitorados: totalLocais,
          falhas: totalFalhas,
          alertas: totalAlertas,
        })

        // LOGS
        if (logs.status === "fulfilled") {
          const logsData = Array.isArray(logs.value?.data?.data)
            ? logs.value.data.data
            : []

          setDadosGrafico(agruparLogsPorDia(logsData))

          setAtividades(
            logsData.slice(0, 15).map((log: any) => ({
              tipo:      log.acao === 'LOGIN' ? 'login' : 'sistema',
              descricao: log.acao === 'LOGIN'
                ? `${log.usuario?.nome ?? 'Utilizador'} fez login`
                : humanizarAcao(log.acao),
              sistema: 'VAR',
              hora:    formatarHora(log.criadoEm),
              status:  log.acao === 'LOGIN' ? 'sucesso' : 'info',
            }))
          )
        }

        // EQUIPA ONLINE
        if (online.status === "fulfilled") {
          const onlineData = Array.isArray(online.value?.data?.data) ? online.value.data.data : []
          setMembrosOnline(
            onlineData.map((u: any) => ({
              nome: u.nome,
              atividade: u.papel === 'Cliente' ? 'Em campo' : 'Monitoramento',
            }))
          )
        }
      } catch (err) {
        console.error("Erro dashboard:", err)
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  return (
    <div>
      <Sidebar3>
        <Container
          titulo="Dashboard"
          notificacao={<Bell size={20} />}
          usuario={nomeUsuario}
        >
          <div className="flex justify-around mb-4">
            <Caixa5 descricao="Funcionários activos" num={cards.funcionariosAtivos} icon={<UserCheck />} />
            <Caixa5 descricao="Locais monitorados" num={cards.locaisMonitorados} icon={<MapPin />} />
            <Caixa5 descricao="Falhas" num={cards.falhas} icon={<AlertCircle />} />
            <Caixa5 descricao="Alertas" num={cards.alertas} icon={<AlertTriangle />} />
          </div>

          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <AtividadesFuncionario2 dados={dadosGrafico} />
            </div>

            <div className="w-125">
              <EquipeOnline membros={membrosOnline} />
            </div>
          </div>

          <AtividadesRecentes atividades={atividades} />
        </Container>
      </Sidebar3>
    </div>
  )
}