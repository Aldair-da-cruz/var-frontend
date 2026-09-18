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



export default function Dashboard() {

  const [loading, setLoading] = useState(true)

  const [alertas, setAlertas] = useState<any>(null)
  const [equipamentos, setEquipamentos] = useState<any>(null)
  const [funcionarios, setFuncionarios] = useState<any>(null)

  useEffect(() => {

    async function load() {
      try {
        setLoading(true)

        const [resAlertas, resEquip, resFunc] = await Promise.all([
          relatorioService.alertas(),
          relatorioService.equipamentos(),
          funcionarioService.listar({ limit: 100 })
        ])

        setAlertas(resAlertas.data.data)
        setEquipamentos(resEquip.data.data)
        setFuncionarios(resFunc.data.data)

      } catch (err) {
        console.error("Erro ao carregar relatórios:", err)
      } finally {
        setLoading(false)
      }
    }

    load()

  }, [])

  return (
    <div>
      <Sidebar3>

        <Container
          titulo="Relatórios"
          notificacao={<Bell size={20} />}
          usuario="Sábado 28/02/2026"
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

              {/* Em pausa / inativos */}
              <Caixa5
                descricao="Em pausa"
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
              <DistribuicaoFuncionarios />
            </div>

            <div className="flex w-full">
              <AlertasRecentes />
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