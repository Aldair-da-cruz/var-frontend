'use client'
import Container from "@/components/container";
import PerfilFuncionario from "@/components/perfilFuncuinario";
import Preferencias from "@/components/preferenciaPerfil";
import Seguranca from "@/components/segurancaPerfil";
import Sidebar3 from "@/components/sidbar3";
import ZonaPerigo from "@/components/zonaPerigo";
import { Bell, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { useTema } from "@/hooks/useTema";

interface Perfil {
    id: string;
    nome: string;
    email: string;
    papel: string;
    status: 'Ativo' | 'Inativo';
    avatarUrl: string | null;
    totpAtivo: boolean;
    notificacaoEmailAtiva: boolean;
}

export default function Dashboard() {
    const [usuarioId, setUsuarioId] = useState('');
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [idioma, setIdioma] = useState("Português (PT)");
    const { tema, aplicarTema } = useTema();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [mensagem, setMensagem] = useState('');

    const [modalSenha, setModalSenha] = useState(false);
    const [formSenha, setFormSenha] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
    const [erroSenha, setErroSenha] = useState('');

    const [modalTotp, setModalTotp] = useState(false);
    const [totpDados, setTotpDados] = useState<{ segredo: string; qrDataUrl: string } | null>(null);
    const [totpCodigo, setTotpCodigo] = useState('');
    const [erroTotp, setErroTotp] = useState('');

    useEffect(() => {
        try {
            const u = JSON.parse(Cookies.get('usuario') ?? '{}');
            if (u?.id) setUsuarioId(u.id);
        } catch { /* ignora */ }
        const idiomaSalvo = typeof window !== 'undefined' ? localStorage.getItem('idioma') : null;
        if (idiomaSalvo) setIdioma(idiomaSalvo);
    }, []);

    useEffect(() => {
        if (usuarioId) carregarPerfil();
    }, [usuarioId]);

    const carregarPerfil = async () => {
        try {
            const res = await api.get(`/usuarios/${usuarioId}`);
            setPerfil(res.data.data);
        } catch { /* ignora */ }
    };

    const avisar = (texto: string) => {
        setMensagem(texto);
        setTimeout(() => setMensagem(''), 3000);
    };

    const handleIdiomaChange = (novoIdioma: string) => {
        setIdioma(novoIdioma);
        if (typeof window !== 'undefined') localStorage.setItem('idioma', novoIdioma);
    };

    const handleTemaChange = (novoTema: string) => {
        aplicarTema(novoTema === 'Claro' ? 'light' : 'dark');
    };

    const handleAvatarSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const ficheiro = e.target.files?.[0];
        if (!ficheiro || !usuarioId) return;
        try {
            const formData = new FormData();
            formData.append('avatar', ficheiro);
            await api.patch(`/usuarios/${usuarioId}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            carregarPerfil();
            avisar('Foto de perfil actualizada');
        } catch {
            avisar('Erro ao actualizar foto de perfil');
        } finally {
            e.target.value = '';
        }
    };

    const alternarNotificacaoEmail = async (ativa: boolean) => {
        if (!usuarioId) return;
        try {
            await api.patch(`/usuarios/${usuarioId}/notificacao`, { ativa });
            carregarPerfil();
        } catch {
            avisar('Erro ao actualizar notificação');
        }
    };

    const salvarSenha = async () => {
        setErroSenha('');
        if (formSenha.novaSenha !== formSenha.confirmar) {
            setErroSenha('As senhas não coincidem.');
            return;
        }
        try {
            await api.patch(`/usuarios/${usuarioId}/senha`, {
                senhaAtual: formSenha.senhaAtual,
                novaSenha:  formSenha.novaSenha,
            });
            setModalSenha(false);
            setFormSenha({ senhaAtual: '', novaSenha: '', confirmar: '' });
            avisar('Senha alterada com sucesso');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setErroSenha(err?.response?.data?.message ?? 'Erro ao alterar senha.');
        }
    };

    const abrirTotp = async () => {
        setErroTotp('');
        setTotpCodigo('');
        if (perfil?.totpAtivo) {
            try {
                await api.delete(`/usuarios/${usuarioId}/totp`);
                carregarPerfil();
                avisar('Autenticação em dois factores desactivada');
            } catch {
                avisar('Erro ao desactivar 2FA');
            }
            return;
        }
        try {
            const res = await api.post(`/usuarios/${usuarioId}/totp/gerar`);
            setTotpDados(res.data.data);
            setModalTotp(true);
        } catch {
            avisar('Erro ao gerar segredo 2FA');
        }
    };

    const ativarTotp = async () => {
        if (!totpDados) return;
        try {
            await api.post(`/usuarios/${usuarioId}/totp/ativar`, { segredo: totpDados.segredo, codigo: totpCodigo });
            setModalTotp(false);
            carregarPerfil();
            avisar('Autenticação em dois factores activada');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setErroTotp(err?.response?.data?.message ?? 'Código inválido');
        }
    };

    const handleExcluirConta = async () => {
        if (!confirm('Tem certeza que deseja desactivar a tua conta? Vais perder o acesso e terás de pedir a um administrador para a reactivar.')) return;
        try {
            await api.delete(`/usuarios/${usuarioId}`);
            Cookies.remove('token');
            Cookies.remove('usuario');
            window.location.href = '/';
        } catch {
            avisar('Erro ao desactivar conta.');
        }
    };

    return(
        <div>
            <Sidebar3>
                <Container titulo="Perfil" notificacao={<Bell size={20} />} usuario={perfil?.nome ?? ''}>

                    {mensagem && (
                        <div className="mx-4 mb-4 p-3 rounded-lg bg-green-600/20 border border-green-600 text-green-400 text-sm">{mensagem}</div>
                    )}

                    {/* Primeira linha - Perfil + Preferências */}
                    <div className="px-4 w-full flex gap-4 mb-4">
                        <div className="flex-1 w-full">
                            <PerfilFuncionario
                                nome={perfil?.nome}
                                cargo={perfil?.papel === 'ADM' ? 'Administrador' : 'Gestor Operacional'}
                                empresa="Kituxi Tech"
                                email={perfil?.email}
                                status={perfil?.status ?? 'Ativo'}
                                avatarUrl={perfil?.avatarUrl}
                                onAlterarFoto={() => avatarInputRef.current?.click()}
                            />
                            <input ref={avatarInputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleAvatarSelecionado} />
                        </div>
                        <div className="flex">
                            <Preferencias
                                alertaAtivo={true}
                                emailAtivo={perfil?.notificacaoEmailAtiva ?? true}
                                idiomaSelecionado={idioma}
                                temaSelecionado={tema === 'light' ? 'Claro' : 'Padrão'}
                                onToggleAlerta={() => avisar('Alertas críticos são sempre visíveis na Gestão de Alertas.')}
                                onToggleEmail={alternarNotificacaoEmail}
                                onIdiomaChange={handleIdiomaChange}
                                onTemaChange={handleTemaChange}
                            />
                        </div>
                    </div>

                    {/* Segunda linha - Segurança + Zona de Perigo */}
                    <div className="px-4 w-full flex gap-4 mb-4">
                        <div className="flex w-full">
                            <Seguranca
                                doisFatoresAtivo={perfil?.totpAtivo ?? false}
                                onToggleDoisFatores={abrirTotp}
                                onAlterarSenha={() => setModalSenha(true)}
                            />
                        </div>
                        <div className="flex">
                            <ZonaPerigo onExcluirConta={handleExcluirConta} />
                        </div>
                    </div>

                </Container>
            </Sidebar3>

            {/* Modal alterar senha */}
            {modalSenha && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Alterar Senha</h2>
                            <button onClick={() => setModalSenha(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        {erroSenha && <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroSenha}</div>}
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">Senha atual</label>
                                <input type="password" value={formSenha.senhaAtual} onChange={(e) => setFormSenha((p) => ({ ...p, senhaAtual: e.target.value }))}
                                    className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">Nova senha</label>
                                <input type="password" value={formSenha.novaSenha} onChange={(e) => setFormSenha((p) => ({ ...p, novaSenha: e.target.value }))}
                                    className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-400">Confirmar nova senha</label>
                                <input type="password" value={formSenha.confirmar} onChange={(e) => setFormSenha((p) => ({ ...p, confirmar: e.target.value }))}
                                    className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={salvarSenha} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">Guardar</button>
                            <button onClick={() => setModalSenha(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2FA */}
            {modalTotp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold text-white mb-4">Autenticação em Dois Fatores</h2>
                        {erroTotp && <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroTotp}</div>}
                        <p className="text-gray-300 text-sm mb-3">Digitaliza o código com a tua aplicação autenticadora:</p>
                        {totpDados?.qrDataUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={totpDados.qrDataUrl} alt="QR code 2FA" className="mx-auto mb-4 rounded-lg bg-white p-2" width={200} height={200} />
                        )}
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={totpCodigo}
                            onChange={(e) => setTotpCodigo(e.target.value.replace(/\D/g, ''))}
                            placeholder="Código de 6 dígitos"
                            className="w-full outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm text-center tracking-[0.3em] focus:border-blue-500"
                        />
                        <div className="flex gap-3 mt-6">
                            <button onClick={ativarTotp} disabled={totpCodigo.length !== 6} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50">Activar</button>
                            <button onClick={() => setModalTotp(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
