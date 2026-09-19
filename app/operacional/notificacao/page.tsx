'use client'
import FiltrosAlertas from "@/components/botaoNotifica";
import Container from "@/components/container";
import EstatisticasAlertas from "@/components/estatisticaNotifica";
import ListaAlertas, { AlertaItem as AlertaItemUI, GrupoAlertas } from "@/components/listaNotifica";
import PesquisarEmpresa from "@/components/pesquisaAlerta";
import Sidebar3 from "@/components/sidbar3";
import UltimaNotificacao from "@/components/ultimaNotifica";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUsuarioNome } from "@/hooks/useUsuarioNome";
import { alertaService } from "@/services";
import type { Alerta } from "@/types";

const NIVEL_POR_FILTRO: Record<string, Alerta['nivel']> = {
  criticos: 'critico',
  alertas: 'medio',
  informacoes: 'razoavel',
}

function tempoRelativo(dataIso: string): string {
  const diffMs = Date.now() - new Date(dataIso).getTime()
  const minutos = Math.floor(diffMs / 60000)
  if (minutos < 1) return 'Agora mesmo'
  if (minutos < 60) return `Há ${minutos} minuto(s)`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Há ${horas} hora(s)`
  const dias = Math.floor(horas / 24)
  return `Há ${dias} dia(s)`
}

function periodoDe(dataIso: string): GrupoAlertas['periodo'] {
  const data = new Date(dataIso)
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(hoje.getDate() - 1)
  if (data.toDateString() === hoje.toDateString()) return 'Hoje'
  if (data.toDateString() === ontem.toDateString()) return 'Ontem'
  return 'Esta semana'
}

export default function Dashboard() {
    const nomeUsuario = useUsuarioNome();
    const [filtro, setFiltro] = useState("alertas");
    const [busca, setBusca] = useState("");
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [resumo, setResumo] = useState({ total: 0, naoLidos: 0, porNivel: { razoavel: 0, medio: 0, critico: 0 } });
    const [alertaDetalhe, setAlertaDetalhe] = useState<Alerta | null>(null);

    const carregar = async () => {
        try {
            const [resAlertas, resResumo] = await Promise.all([
                alertaService.listar({ limit: 100 }),
                alertaService.resumo(),
            ]);
            setAlertas(resAlertas.data.data ?? []);
            setResumo(resResumo.data.data);
        } catch { /* ignora */ }
    };

    useEffect(() => { carregar() }, []);

    const resolver = async (id: string) => {
        try {
            await alertaService.marcarLido(id);
            carregar();
        } catch { /* ignora */ }
    };

    const alertasFiltrados = alertas.filter((a) => {
        const nivelAlvo = NIVEL_POR_FILTRO[filtro];
        if (nivelAlvo && a.nivel !== nivelAlvo) return false;
        if (!busca) return true;
        const texto = `${a.equipamento?.nome ?? ''} ${a.equipamento?.localizacao ?? ''} ${a.descricao}`.toLowerCase();
        return texto.includes(busca.toLowerCase());
    });

    const grupos: GrupoAlertas[] = (['Hoje', 'Ontem', 'Esta semana'] as const).map((periodo) => ({
        periodo,
        itens: alertasFiltrados
            .filter((a) => periodoDe(a.criadoEm) === periodo)
            .map((a): AlertaItemUI => ({
                id: a.id,
                titulo: a.equipamento?.nome ?? 'Equipamento',
                descricao: a.descricao,
                unidade: a.equipamento?.localizacao,
                tempo: tempoRelativo(a.criadoEm),
                resolvido: !!a.lidoEm,
            })),
    }));

    const alertaCritico = alertas.find((a) => a.nivel === 'critico' && !a.lidoEm) ?? alertas[0] ?? null;

    return(
        <div>
            <Sidebar3>
                <Container titulo="Notificações" notificacao={<Bell size={20} />} usuario={nomeUsuario}>
                    <div className="flex gap-2">
                        {/* Coluna esquerda */}
                        <div className="p-5 w-225 flex flex-col gap-4">
                            <FiltrosAlertas
                                filtroAtivo={filtro}
                                onFiltroChange={setFiltro}
                            />
                            <PesquisarEmpresa placeholder="Pesquisar notificação..." value={busca} onSearch={setBusca} />
                            <ListaAlertas grupos={grupos} onResolver={resolver} onVerDetalhes={(item) => {
                                const original = alertas.find((a) => a.id === item.id)
                                if (original) setAlertaDetalhe(original)
                            }} />
                        </div>

                        {/* Coluna direita */}
                        <div className="p-5 w-100 flex flex-col gap-3">
                            <EstatisticasAlertas
                                dados={[
                                    { cor: 'bg-red-500', label: 'Críticos', valor: resumo.porNivel.critico },
                                    { cor: 'bg-orange-500', label: 'Alertas', valor: resumo.porNivel.medio },
                                    { cor: 'bg-gray-400', label: 'Informativas', valor: resumo.porNivel.razoavel },
                                ]}
                                total={resumo.total}
                            />
                            {alertaCritico && (
                                <UltimaNotificacao
                                    titulo={alertaCritico.equipamento?.nome ?? 'Equipamento'}
                                    descricao={alertaCritico.descricao}
                                    unidade={alertaCritico.equipamento?.localizacao ?? ''}
                                    tempo={tempoRelativo(alertaCritico.criadoEm)}
                                    onVerDetalhes={() => setAlertaDetalhe(alertaCritico)}
                                    onResolver={() => resolver(alertaCritico.id)}
                                />
                            )}
                        </div>
                    </div>
                </Container>
            </Sidebar3>

            {/* Modal detalhes do alerta */}
            {alertaDetalhe && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setAlertaDetalhe(null)}>
                    <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Detalhes do Alerta</h2>
                            <button onClick={() => setAlertaDetalhe(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="flex flex-col gap-2 text-sm">
                            <p><span className="text-gray-400">Equipamento:</span> <span className="text-white">{alertaDetalhe.equipamento?.nome}</span></p>
                            <p><span className="text-gray-400">Localização:</span> <span className="text-white">{alertaDetalhe.equipamento?.localizacao}</span></p>
                            <p><span className="text-gray-400">Nível:</span> <span className="text-white capitalize">{alertaDetalhe.nivel}</span></p>
                            <p><span className="text-gray-400">Descrição:</span> <span className="text-white">{alertaDetalhe.descricao}</span></p>
                            <p><span className="text-gray-400">Data:</span> <span className="text-white">{new Date(alertaDetalhe.criadoEm).toLocaleString('pt-PT')}</span></p>
                            <p><span className="text-gray-400">Estado:</span> <span className="text-white">{alertaDetalhe.lidoEm ? `Resolvido por ${alertaDetalhe.lidoPor?.nome ?? '—'}` : 'Por resolver'}</span></p>
                        </div>
                        {!alertaDetalhe.lidoEm && (
                            <button
                                onClick={() => { resolver(alertaDetalhe.id); setAlertaDetalhe(null) }}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
                            >
                                Marcar como resolvido
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
