'use client'

import { useEffect, useState, useCallback } from "react"

import Caixa5 from "@/components/caixa5"
import Container from "@/components/container"
import Sidebar3 from "@/components/sidbar3"
import Tabela8, { Empresa } from "@/components/tabela8"

import {
    AlertTriangle,
    Bell,
    Building2,
    MonitorPause,
    MonitorPlay,
    X
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

import { useUsuarioNome } from "@/hooks/useUsuarioNome"

export default function Dashboard() {

    // ── STATES ─────────────────────────────

    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [empresasBrutas, setEmpresasBrutas] = useState<EmpresaAPI[]>([])
    const [totalAlertas, setTotalAlertas] = useState(0)
    const [totalAtivas, setTotalAtivas] = useState(0)
    const [totalInativas, setTotalInativas] = useState(0)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    const [filtroStatus, setFiltroStatus] = useState<'Ativo' | 'Inativo'>('Ativo')
    const [pesquisa, setPesquisa] = useState("")
    const [paginaAtual, setPaginaAtual] = useState(1)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const nomeUsuario = useUsuarioNome()

    // Modal editar
    const [modalEditar, setModalEditar] = useState(false)
    const [empresaSel, setEmpresaSel] = useState<EmpresaAPI | null>(null)
    const [formEditar, setFormEditar] = useState({ nome: '', email: '', telefone: '' })
    const [loadingEditar, setLoadingEditar] = useState(false)
    const [erroEditar, setErroEditar] = useState('')

    // Modal confirmar acção
    const [modalAccao, setModalAccao] = useState(false)
    const [tipoAccao, setTipoAccao] = useState<'ativar' | 'desativar'>('desativar')
    const [loadingAccao, setLoadingAccao] = useState(false)

    // ── BUSCAR DADOS API ───────────────────

    const carregar = useCallback(async () => {
        try {
            setLoading(true)

            const [empresasRes, alertasRes, resAtivas, resInativas] = await Promise.allSettled([
                empresaService.listar({ page: paginaAtual, limit: 10, search: pesquisa || undefined, status: filtroStatus }),
                alertaService.resumo(),
                empresaService.listar({ limit: 1, status: 'Ativo' }),
                empresaService.listar({ limit: 1, status: 'Inativo' }),
            ])

            const listaAPI: EmpresaAPI[] =
                empresasRes.status === "fulfilled"
                    ? empresasRes.value.data.data ?? []
                    : []

            setEmpresasBrutas(listaAPI)
            setEmpresas(listaAPI.map(mapEmpresaToTabela))
            setTotalPaginas(empresasRes.status === 'fulfilled' ? empresasRes.value.data.meta?.totalPages ?? 1 : 1)

            setTotalAlertas(alertasRes.status === "fulfilled" ? alertasRes.value.data?.data?.total ?? 0 : 0)
            setTotalAtivas(resAtivas.status === 'fulfilled' ? resAtivas.value.data.meta?.total ?? 0 : 0)
            setTotalInativas(resInativas.status === 'fulfilled' ? resInativas.value.data.meta?.total ?? 0 : 0)

            if (empresasRes.status === 'rejected') setErro('Erro ao carregar empresas.')
            else setErro('')
        } catch {
            setErro('Erro ao carregar empresas.')
        } finally {
            setLoading(false)
        }
    }, [paginaAtual, pesquisa, filtroStatus])

    useEffect(() => {
        const timer = setTimeout(carregar, 300)
        return () => clearTimeout(timer)
    }, [carregar])

    // ── AÇÕES ──────────────────────────────

    const abrirEditar = (empresa: EmpresaAPI) => {
        setEmpresaSel(empresa)
        setFormEditar({ nome: empresa.nome, email: empresa.email, telefone: empresa.telefone ?? '' })
        setErroEditar('')
        setModalEditar(true)
    }

    const salvarEditar = async () => {
        if (!empresaSel) return
        try {
            setLoadingEditar(true)
            await empresaService.atualizar(empresaSel.id, formEditar)
            setModalEditar(false)
            carregar()
        } catch (err: any) {
            setErroEditar(err?.response?.data?.message ?? 'Erro ao actualizar.')
        } finally {
            setLoadingEditar(false)
        }
    }

    const abrirAccao = (empresa: EmpresaAPI, tipo: 'ativar' | 'desativar') => {
        setEmpresaSel(empresa)
        setTipoAccao(tipo)
        setModalAccao(true)
    }

    const confirmarAccao = async () => {
        if (!empresaSel) return
        try {
            setLoadingAccao(true)
            if (tipoAccao === 'desativar') {
                await empresaService.desativar(empresaSel.id)
            } else {
                await empresaService.ativar(empresaSel.id)
            }
            setModalAccao(false)
            setEmpresaSel(null)
            carregar()
        } catch (err: any) {
            alert(err?.response?.data?.message ?? 'Erro ao realizar acção.')
            setModalAccao(false)
        } finally {
            setLoadingAccao(false)
        }
    }

    // ── LIGAÇÃO ENTRE LINHAS DA TABELA E AÇÕES ─

    const dadosTabela: Empresa[] = empresas.map((e, i) => {
        const bruta = empresasBrutas[i]
        return {
            ...e,
            onEditar: () => bruta && abrirEditar(bruta),
            onAtivar: () => bruta && abrirAccao(bruta, 'ativar'),
            onDesativar: () => bruta && abrirAccao(bruta, 'desativar'),
        }
    })

    // ── RENDER ─────────────────────────────

    return (
        <div>

            <Sidebar3>

                <Container
                    titulo="Gerir empresas"
                    notificacao={<Bell size={20} />}
                    usuario={nomeUsuario}
                >

                    {/* CARDS */}

                    <div className="flex justify-around mb-4">

                        <Caixa5
                            descricao="Total de empresas"
                            num={totalAtivas + totalInativas}
                            icon={<Building2 size={20} color="green" />}
                        />

                        <Caixa5
                            descricao="Em serviço"
                            num={totalAtivas}
                            icon={<MonitorPlay size={20} color="green" />}
                        />

                        <Caixa5
                            descricao="Inactivas"
                            num={totalInativas}
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
                        status={filtroStatus}
                        onStatusChange={(s) => { setFiltroStatus(s); setPaginaAtual(1) }}
                        onSearchChange={(s) => { setPesquisa(s); setPaginaAtual(1) }}
                    />

                    {erro && (
                        <div className="mx-4 mb-4 p-3 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erro}</div>
                    )}

                    {/* TABELA */}

                    <div className="mt-4 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl overflow-auto">
                        {loading ? (
                            <p className="text-gray-400 text-sm text-center py-8">A carregar...</p>
                        ) : (
                            <Tabela8 dados={dadosTabela} />
                        )}
                    </div>

                    {totalPaginas > 1 && (
                        <div className="flex justify-center gap-2 mt-4 mb-4">
                            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                                <button key={p} onClick={() => setPaginaAtual(p)}
                                    className={`w-8 h-8 rounded-lg text-sm ${p === paginaAtual ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                </Container>

            </Sidebar3>

            {/* Modal Editar */}
            {modalEditar && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Editar Empresa</h2>
                            <button onClick={() => setModalEditar(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        {erroEditar && (
                            <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroEditar}</div>
                        )}
                        <div className="flex flex-col gap-3">
                            {[{ label: 'Nome', campo: 'nome' }, { label: 'Email', campo: 'email' }, { label: 'Telefone', campo: 'telefone' }].map(({ label, campo }) => (
                                <div key={campo} className="flex flex-col gap-1">
                                    <label className="text-sm text-gray-400">{label}</label>
                                    <input
                                        value={(formEditar as any)[campo]}
                                        onChange={(e) => setFormEditar((prev) => ({ ...prev, [campo]: e.target.value }))}
                                        className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={salvarEditar} disabled={loadingEditar}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">
                                {loadingEditar ? 'A guardar...' : 'Guardar'}
                            </button>
                            <button onClick={() => setModalEditar(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Activar/Desactivar */}
            {modalAccao && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold text-white mb-2">
                            {tipoAccao === 'desativar' ? 'Desactivar empresa' : 'Activar empresa'}
                        </h2>
                        <p className="text-gray-300 text-sm mb-6">
                            Tens a certeza que queres {tipoAccao === 'desativar' ? 'desactivar' : 'activar'} a empresa{' '}
                            <span className="text-white font-medium">{empresaSel?.nome}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={confirmarAccao} disabled={loadingAccao}
                                className={`flex-1 text-white py-2 rounded-lg text-sm disabled:opacity-50 ${tipoAccao === 'desativar' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                {loadingAccao ? 'A processar...' : 'Confirmar'}
                            </button>
                            <button onClick={() => setModalAccao(false)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
