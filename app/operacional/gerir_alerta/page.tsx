'use client'

import { useEffect, useState } from 'react'
import Container from "@/components/container"
import ListaEmpresas from "@/components/listaEmpresa"
import PesquisarEmpresa from "@/components/pesquisaAlerta"
import Sidebar3 from "@/components/sidbar3"
import { Bell, LayoutGrid, List } from "lucide-react"

import { empresaService } from "@/services"
import {
  EmpresaListaAlerta,
  EmpresaAlertaAPI,
  mapEmpresaAlerta
} from "@/dto/alertEmpresa.dto"
import { useUsuarioNome } from "@/hooks/useUsuarioNome"

export default function Dashboard() {

  const [visualizacao, setVisualizacao] = useState<'grelha' | 'coluna'>('grelha')
  const [empresas, setEmpresas] = useState<EmpresaListaAlerta[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const nomeUsuario = useUsuarioNome()

  useEffect(() => {
    async function carregar() {
      try {
        const res = await empresaService.listar({ limit: 100 })

        console.log("RES ALERTAS:", res.data)

        // ✅ CORREÇÃO CRÍTICA: fallback seguro
        const listaAPI: EmpresaAlertaAPI[] =
          res.data?.data ?? []

        const lista = listaAPI.map(mapEmpresaAlerta)

        setEmpresas(lista)

      } catch (err) {
        console.error("Erro ao carregar empresas:", err)
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [])

  const empresasFiltradas = empresas.filter((e) =>
    !busca || e.nome.toLowerCase().includes(busca.toLowerCase()) || e.nif.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <Sidebar3>

        <Container
          titulo="Gerir alertas"
          notificacao={<Bell size={20} />}
          usuario={nomeUsuario}
        >

          <div className="space-y-4">

            {/* topo */}
            <div className="flex items-center gap-3">

              <div className="flex-1">
                <PesquisarEmpresa placeholder="Pesquisar empresa..." value={busca} onSearch={setBusca} />
              </div>

              <div className="flex bg-[#040928] border border-[#050e4c] rounded-lg p-1">

                <button
                  onClick={() => setVisualizacao('grelha')}
                  className={`p-2 ${visualizacao === 'grelha' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                >
                  <LayoutGrid size={18} />
                </button>

                <button
                  onClick={() => setVisualizacao('coluna')}
                  className={`p-2 ${visualizacao === 'coluna' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                >
                  <List size={18} />
                </button>

              </div>
            </div>

            {/* loading simples */}
            {loading ? (
              <p className="text-gray-400">Carregando empresas...</p>
            ) : (
              <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-4">
                <ListaEmpresas
                  empresas={empresasFiltradas}
                  titulo="Empresas com alertas"
                  visualizacao={visualizacao}
                />
              </div>
            )}

          </div>

        </Container>

      </Sidebar3>
    </div>
  )
}