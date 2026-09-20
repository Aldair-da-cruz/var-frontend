'use client'

import { useEffect, useState } from "react"
import AlertasRecentes from "@/components/alertaRelat"
import Caixa5 from "@/components/caixa5"
import Container from "@/components/container"
import DistribuicaoFuncionarios from "@/components/funcionarioRelat"
import FuncionariosInativos from "@/components/funinativoRelat"
import Sidebar3 from "@/components/sidbar3"

import {
  Bell,
  CirclePause,
  UserCheck2,
  Users,
  UserX
} from "lucide-react"

import { relatorioService } from "@/services/relatorioService"
import { funcionarioService } from "@/services/funcionarioServices"
import { alertaService } from "@/services"
import { useUsuarioNome } from "@/hooks/useUsuarioNome"
import type { AlertaItem as AlertaRecenteItem } from "@/components/alertaRelat"
import type { DistribuicaoItem } from "@/components/funcionarioRelat"

const CATEGORIA_POR_NIVEL: Record<string, AlertaRecenteItem['categoria']> = {
  critico: 'Grave',
  medio: 'Médio',
  razoavel: 'Leve',
}



export default function Dashboard() {

  const [loading, setLoading] = useState(true)

  const [alertas, setAlertas] = useState<any>(null)
  const [equipamentos, setEquipamentos] = useState<any>(null)
  const [funcionarios, setFuncionarios] = useState<any>(null)
  const [alertasRecentes, setAlertasRecentes] = useState<AlertaRecenteItem[]>([])
  const nomeUsuario = useUsuarioNome()

  useEffect(() => {

    async function load() {
      try {
        setLoading(true)

        const [resAlertas, resEquip, resFunc, resAlertasRecentes] = await Promise.all([
          relatorioService.alertas(),
          relatorioService.equipamentos(),
          funcionarioService.listar({ limit: 100 }),
          alertaService.listar({ limit: 10 }),
        ])

        setAlertas(resAlertas.data.data)
        setEquipamentos(resEquip.data.data)
        setFuncionarios(resFunc.data.data)
        setAlertasRecentes(
          (resAlertasRecentes.data.data ?? []).map((a): AlertaRecenteItem => ({
            empresa: a.empresa?.nome ?? '—',
            designacao: a.equipamento?.nome ?? '—',
            categoria: CATEGORIA_POR_NIVEL[a.nivel] ?? 'Leve',
            data: new Date(a.criadoEm).toLocaleString('pt-PT'),
          }))
        )

      } catch (err) {
        console.error("Erro ao carregar relatórios:", err)
      } finally {
        setLoading(false)
      }
    }

    load()

  }, [])

  const distribuicaoPorEmpresa: DistribuicaoItem[] = Object.values(
    (funcionarios ?? []).reduce((acc: Record<string, DistribuicaoItem>, f: any) => {
      const nome = f.empresa?.nome ?? 'Sem empresa'
      if (!acc[nome]) acc[nome] = { label: nome, quantidade: 0 }
      acc[nome].quantidade++
      return acc
    }, {})
  )

  return (
    <div>
      <Sidebar3>

        <Container
          titulo="Relatórios"
          notificacao={<Bell size={20} />}
          usuario={nomeUsuario}
        >

          {/* LOADING SIMPLES */}
          {loading && (
            <div className="text-gray-400 p-4">
              Carregando relatórios...
            </div>
          )}

          {/* CARDS SUPERIORES */}
          {!loading && (
            <div className="flex justify-around mb-4">

              {/* Funcionários cadastrados */}
              <Caixa5
                descricao="Funcionarios cadastrados"
                num={funcionarios?.length ?? 0}
                icon={<Users size={20} color="green" />}
              />

              {/* Em serviço (ativos) */}
              <Caixa5
                descricao="Em serviço"
                num={
                  funcionarios?.filter((f: any) => f.status === "Ativo")?.length ?? 0
                }
                icon={<UserCheck2 size={20} color="green" />}
              />

              {/* Inativos */}
              <Caixa5
                descricao="Inativos"
                num={
                  funcionarios?.filter((f: any) => f.status === "Inativo")?.length ?? 0
                }
                icon={<UserX size={20} color="yellow" />}
              />

              {/* ALERTAS REAIS */}
              <Caixa5
                descricao="Alertas"
                num={alertas?.total ?? 0}
                icon={<CirclePause size={20} color="red" />}
              />

            </div>
          )}

          {/* PRIMEIRA LINHA */}
          <div className="px-4 w-full flex gap-4 mb-4">

            <div className="flex-1">
              <DistribuicaoFuncionarios dados={distribuicaoPorEmpresa} />
            </div>

            <div className="flex w-full">
              <AlertasRecentes alertas={alertasRecentes} />
            </div>

          </div>

          {/* SEGUNDA LINHA */}
          <div className="px-5 w-full">
            <FuncionariosInativos
              dados={(funcionarios ?? []).filter((f: any) => f.status !== 'Ativo')}
              loading={loading}
            />
          </div>

          {/* EXTRA: RESUMO RÁPIDO (NOVO) */}
          {!loading && (
            <div className="px-5 mt-4 grid grid-cols-3 gap-4">

              {/* Equipamentos */}
              <div className="bg-[#040928] border border-[#050e4c] p-4 rounded-xl">
                <h2 className="text-white text-sm mb-2">
                  Equipamentos
                </h2>

                <p className="text-blue-400 text-xl font-bold">
                  {equipamentos?.total ?? 0}
                </p>

                <p className="text-gray-500 text-xs">
                  Total monitorados
                </p>
              </div>

              {/* Alertas */}
              <div className="bg-[#040928] border border-[#050e4c] p-4 rounded-xl">
                <h2 className="text-white text-sm mb-2">
                  Alertas ativos
                </h2>

                <p className="text-red-400 text-xl font-bold">
                  {alertas?.total ?? 0}
                </p>

                <p className="text-gray-500 text-xs">
                  Sistema em tempo real
                </p>
              </div>

              {/* Funcionários */}
              <div className="bg-[#040928] border border-[#050e4c] p-4 rounded-xl">
                <h2 className="text-white text-sm mb-2">
                  Funcionários
                </h2>

                <p className="text-green-400 text-xl font-bold">
                  {funcionarios?.length ?? 0}
                </p>

                <p className="text-gray-500 text-xs">
                  Total registados
                </p>
              </div>

            </div>
          )}

        </Container>
      </Sidebar3>
    </div>
  )
}