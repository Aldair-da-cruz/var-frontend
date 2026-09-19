'use client'

import { useEffect, useState } from "react"
import Container from "@/components/container"
import EstatisticasEquipamentos from "@/components/estatEqui"
import ListaEquipamentos from "@/components/listaEquip"
import PesquisarEquipamento from "@/components/pesquisaEqui"
import Sidebar3 from "@/components/sidbar3"
import { ArrowLeft, Bell, X } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"
import BotoesAcao from "@/components/botaoAc"

import { empresaService, equipamentoService } from "@/services"
import { mapEquipamento } from "@/dto/equipamento.dto"
import { useUsuarioNome } from "@/hooks/useUsuarioNome"
import type { Equipamento } from "@/types"

export default function DetalheEmpresaPage() {
  const params = useParams()
  const empresaId = params.id as string
  const nomeUsuario = useUsuarioNome()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [empresa, setEmpresa] = useState<any>(null)
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const [modalAdicionar, setModalAdicionar] = useState(false)
  const [formEquip, setFormEquip] = useState({ nome: '', modelo: '', fabricante: '', numeroSerie: '', localizacao: '' })
  const [erroEquip, setErroEquip] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [reativando, setReativando] = useState(false)
  const [aviso, setAviso] = useState('')

  const carregar = async () => {
    try {
      const [empresaRes, equipamentosRes] = await Promise.all([
        empresaService.buscar(empresaId),
        equipamentoService.listar({ empresaId, limit: 100 })
      ])

      setEmpresa(empresaRes.data.data)
      setEquipamentos(equipamentosRes.data.data ?? [])

    } catch (err) {
      console.error("Erro ao carregar empresa:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (empresaId) carregar()
  }, [empresaId])

  const avisar = (texto: string) => {
    setAviso(texto)
    setTimeout(() => setAviso(''), 3000)
  }

  const equipamentosFiltrados = equipamentos.filter((eq) =>
    !busca ||
    eq.nome.toLowerCase().includes(busca.toLowerCase()) ||
    eq.localizacao.toLowerCase().includes(busca.toLowerCase()) ||
    eq.modelo.toLowerCase().includes(busca.toLowerCase())
  )

  const abrirModalAdicionar = () => {
    setFormEquip({ nome: '', modelo: '', fabricante: '', numeroSerie: '', localizacao: '' })
    setErroEquip('')
    setModalAdicionar(true)
  }

  const salvarEquipamento = async () => {
    if (!formEquip.nome || !formEquip.modelo || !formEquip.localizacao) {
      setErroEquip('Preenche nome, modelo e localização.')
      return
    }
    try {
      setSalvando(true)
      await equipamentoService.criar({ ...formEquip, empresaId })
      setModalAdicionar(false)
      await carregar()
      avisar('Equipamento adicionado com sucesso')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErroEquip(err?.response?.data?.message ?? 'Erro ao adicionar equipamento.')
    } finally {
      setSalvando(false)
    }
  }

  const reativarMonitoramento = async () => {
    const emManutencao = equipamentos.filter((e) => e.status === 'Manutencao')
    if (emManutencao.length === 0) {
      avisar('Nenhum equipamento em manutenção para reativar.')
      return
    }
    try {
      setReativando(true)
      await Promise.all(emManutencao.map((e) => equipamentoService.atualizar(e.id, { status: 'Operacional' })))
      await carregar()
      avisar(`${emManutencao.length} equipamento(s) reativado(s)`)
    } catch {
      avisar('Erro ao reativar monitoramento.')
    } finally {
      setReativando(false)
    }
  }

  if (loading) {
    return (
      <Sidebar3>
        <Container titulo="Carregando..." notificacao={<Bell size={20} />} usuario={nomeUsuario}>
          <div className="text-white">A carregar dados...</div>
        </Container>
      </Sidebar3>
    )
  }

  if (!empresa) {
    return (
      <Sidebar3>
        <Container titulo="Empresa não encontrada" notificacao={<Bell size={20} />} usuario={nomeUsuario}>
          <div className="text-white">Empresa não encontrada</div>
        </Container>
      </Sidebar3>
    )
  }

  const totalOnline = equipamentos.filter((e) => e.status === 'Operacional' && (e._count?.alertas ?? 0) === 0).length
  const totalAviso = equipamentos.filter((e) => e.status === 'Manutencao' || (e._count?.alertas ?? 0) > 0).length

  return (
    <Sidebar3>
      <Container
        titulo={empresa.nome}
        notificacao={<Bell size={20} />}
        usuario={nomeUsuario}
      >
        {aviso && (
          <div className="mb-3 p-2 rounded-lg bg-green-600/20 border border-green-600 text-green-400 text-sm">{aviso}</div>
        )}

        <div className="space-y-4 flex gap-10">

          {/* LADO ESQUERDO */}
          <div className="flex flex-col gap-4 w-200">

            <Link
              href="/operacional/gerir_alerta"
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </Link>

            <PesquisarEquipamento placeholder="pesquisar equipamento..." onSearch={setBusca} />

            <EstatisticasEquipamentos
              online={totalOnline}
              aviso={totalAviso}
              offline={0}
            />

            <ListaEquipamentos equipamentos={equipamentosFiltrados.map(mapEquipamento)} />
          </div>

          {/* LADO DIREITO */}
          <div className="w-125 h-full flex flex-col items-end">
            <BotoesAcao
              onAdicionarEquipamento={abrirModalAdicionar}
              onReativarMonitoramento={reativarMonitoramento}
            />
          </div>

        </div>
      </Container>

      {/* Modal Adicionar Equipamento */}
      {modalAdicionar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Adicionar Equipamento</h2>
              <button onClick={() => setModalAdicionar(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {erroEquip && (
              <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroEquip}</div>
            )}

            <div className="flex flex-col gap-3">
              {[
                { label: 'Nome *', campo: 'nome' },
                { label: 'Modelo *', campo: 'modelo' },
                { label: 'Fabricante', campo: 'fabricante' },
                { label: 'Número de série', campo: 'numeroSerie' },
                { label: 'Localização *', campo: 'localizacao' },
              ].map(({ label, campo }) => (
                <div key={campo} className="flex flex-col gap-1">
                  <label className="text-sm text-gray-400">{label}</label>
                  <input
                    value={(formEquip as Record<string, string>)[campo]}
                    onChange={(e) => setFormEquip((prev) => ({ ...prev, [campo]: e.target.value }))}
                    className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={salvarEquipamento} disabled={salvando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                {salvando ? 'A guardar...' : 'Adicionar'}
              </button>
              <button onClick={() => setModalAdicionar(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar3>
  )
}
