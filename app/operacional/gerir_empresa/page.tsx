'use client'

import { useEffect, useState } from "react"

import Caixa5 from "@/components/caixa5"
import Container from "@/components/container"
import Sidebar3 from "@/components/sidbar3"
import Tabela8, { Empresa } from "@/components/tabela8"

import {
    AlertTriangle,
    Bell,
    Building2,
    MonitorPause,
    MonitorPlay
} from "lucide-react"

import FiltrosEmpresas from "@/components/filtroEmpresa"

import {
    alertaService,
    empresaService
} from "@/services"

import {
    mapEmpresaToTabela,
    EmpresaAPI
} from "@/dto/empresa.dto"

export default function Dashboard() {

    // ── STATES ─────────────────────────────

    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [totalAlertas, setTotalAlertas] = useState(0)
    const [loading, setLoading] = useState(true)

    const [filtroStatus, setFiltroStatus] = useState("")
    const [filtroLocal, setFiltroLocal] = useState("")
    const [filtroDesignacao, setFiltroDesignacao] = useState("")
    const [pesquisa, setPesquisa] = useState("")

    // ── BUSCAR DADOS API ───────────────────

    useEffect(() => {

        async function carregar() {

            try {

                const [empresasRes, alertasRes] = await Promise.allSettled([
                    empresaService.listar({ limit: 100 }),
                    alertaService.resumo()
                ])

                // ── EMPRESAS ─────────────────

                const listaAPI: EmpresaAPI[] =
                    empresasRes.status === "fulfilled"
                        ? empresasRes.value.data.data ?? []
                        : []

                console.log("EMPRESAS API:", listaAPI)

                // DTO → UI

                const lista = listaAPI.map(mapEmpresaToTabela)

                console.log("EMPRESAS DTO:", lista)

                setEmpresas(lista)

                // ── ALERTAS ──────────────────

                const total =
                    alertasRes.status === "fulfilled"
                        ? alertasRes.value.data?.data?.total ?? 0
                        : 0

                setTotalAlertas(total)

            } catch (err) {

                console.error("Erro ao carregar empresas:", err)

            } finally {

                setLoading(false)

            }
        }

        carregar()

    }, [])

    // ── FILTROS ────────────────────────────

    const dadosFiltrados = empresas.filter(item => {

        const matchStatus =
            !filtroStatus ||
            item.status === filtroStatus

        const matchLocal =
            !filtroLocal ||
            item.local.toLowerCase().includes(filtroLocal.toLowerCase())

        const matchDesignacao =
            !filtroDesignacao ||
            item.designacao.toLowerCase().includes(filtroDesignacao.toLowerCase())

        const matchPesquisa =
            !pesquisa ||
            item.empresa.toLowerCase().includes(pesquisa.toLowerCase()) ||
            item.designacao.toLowerCase().includes(pesquisa.toLowerCase()) ||
            item.local.toLowerCase().includes(pesquisa.toLowerCase())

        return (
            matchStatus &&
            matchLocal &&
            matchDesignacao &&
            matchPesquisa
        )
    })

    // ── STATS ──────────────────────────────

    const totalEmpresas = empresas.length

    const emServico =
        empresas.filter(e => e.status === "Ativo").length

    const emPausa =
        empresas.filter(e => e.status === "Em pausa").length

    // ── RENDER ─────────────────────────────

    return (
        <div>

            <Sidebar3>

                <Container
                    titulo="Gerir empresas"
                    notificacao={<Bell size={20} />}
                    usuario="Sábado 28/02/2026"
                >

                    {/* CARDS */}

                    <div className="flex justify-around mb-4">

                        <Caixa5
                            descricao="Total de empresas"
                            num={totalEmpresas}
                            icon={<Building2 size={20} color="green" />}
                        />

                        <Caixa5
                            descricao="Em serviço"
                            num={emServico}
                            icon={<MonitorPlay size={20} color="green" />}
                        />

                        <Caixa5
                            descricao="Em pausa"
                            num={emPausa}
                            icon={<MonitorPause size={20} color="yellow" />}
                        />

                        <Caixa5
                            descricao="Alertas"
                            num={totalAlertas}
                            icon={<AlertTriangle size={20} color="red" />}
                        />

                    </div>

                    {/* FILTROS */}

                    <FiltrosEmpresas
                        onStatusChange={setFiltroStatus}
                        onLocalChange={setFiltroLocal}
                        onDesignacaoChange={setFiltroDesignacao}
                        onSearchChange={setPesquisa}
                    />

                    {/* TABELA */}

                    <div className="mt-4 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl overflow-auto">

                        <Tabela8 dados={dadosFiltrados} />

                    </div>

                </Container>

            </Sidebar3>

        </div>
    )
}