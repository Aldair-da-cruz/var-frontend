"use client";

import { useEffect, useRef, useState } from "react";
import CardDef from "@/components/cardDef";
import Container from "@/components/container";
import Sidebar from "@/components/sidebar";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import Cookies from "js-cookie";

interface UsuarioPerfil {
  id: string;
  nome: string;
  email: string;
  avatarUrl: string | null;
  totpAtivo: boolean;
  notificacaoEmailAtiva: boolean;
}

interface Sessao {
  id: string;
  userAgent: string | null;
  ip: string | null;
  criadoEm: string;
  ultimoUso: string;
}

export default function Home() {
  const [usuarioId, setUsuarioId] = useState('')
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null)
  const [plataforma, setPlataforma] = useState({ nome: 'Kituxi Tech', logotipoUrl: null as string | null, idioma: 'pt-PT' })
  const [tema, setTema] = useState<'dark' | 'light'>('dark')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const restaurarInputRef = useRef<HTMLInputElement>(null)

  // Modais
  const [modalPerfil, setModalPerfil] = useState(false)
  const [formPerfil, setFormPerfil] = useState({ nome: '', email: '' })
  const [erroPerfil, setErroPerfil] = useState('')

  const [modalSenha, setModalSenha] = useState(false)
  const [formSenha, setFormSenha] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' })
  const [erroSenha, setErroSenha] = useState('')

  const [modalTotp, setModalTotp] = useState(false)
  const [totpDados, setTotpDados] = useState<{ segredo: string; qrDataUrl: string } | null>(null)
  const [totpCodigo, setTotpCodigo] = useState('')
  const [erroTotp, setErroTotp] = useState('')

  const [modalSessoes, setModalSessoes] = useState(false)
  const [sessoes, setSessoes] = useState<Sessao[]>([])

  const [modalEmpresa, setModalEmpresa] = useState(false)
  const [formEmpresa, setFormEmpresa] = useState({ nome: '', idioma: 'pt-PT' })

  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    try {
      const u = JSON.parse(Cookies.get('usuario') ?? '{}')
      if (u?.id) setUsuarioId(u.id)
    } catch { /* ignora */ }

    const temaSalvo = (typeof window !== 'undefined' && localStorage.getItem('tema')) as 'dark' | 'light' | null
    if (temaSalvo) aplicarTema(temaSalvo)
  }, [])

  useEffect(() => {
    if (!usuarioId) return
    carregarPerfil()
    carregarPlataforma()
  }, [usuarioId])

  const carregarPerfil = async () => {
    try {
      const res = await api.get(`/usuarios/${usuarioId}`)
      setPerfil(res.data.data)
    } catch { /* ignora */ }
  }

  const carregarPlataforma = async () => {
    try {
      const res = await api.get('/plataforma')
      setPlataforma(res.data.data)
    } catch { /* ignora */ }
  }

  const avisar = (texto: string) => {
    setMensagem(texto)
    setTimeout(() => setMensagem(''), 3000)
  }

  const aplicarTema = (novoTema: 'dark' | 'light') => {
    setTema(novoTema)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tema', novoTema)
      document.documentElement.setAttribute('data-tema', novoTema)
    }
  }

  // ── Nome / Email ──
  const abrirEditarPerfil = () => {
    if (!perfil) return
    setFormPerfil({ nome: perfil.nome, email: perfil.email })
    setErroPerfil('')
    setModalPerfil(true)
  }

  const salvarPerfil = async () => {
    try {
      await api.patch(`/usuarios/${usuarioId}`, formPerfil)
      const usuarioCookie = JSON.parse(Cookies.get('usuario') ?? '{}')
      Cookies.set('usuario', JSON.stringify({ ...usuarioCookie, ...formPerfil }), { path: '/' })
      setModalPerfil(false)
      carregarPerfil()
      avisar('Perfil actualizado com sucesso')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErroPerfil(err?.response?.data?.message ?? 'Erro ao actualizar perfil.')
    }
  }

  // ── Senha ──
  const salvarSenha = async () => {
    setErroSenha('')
    if (formSenha.novaSenha !== formSenha.confirmar) {
      setErroSenha('As senhas não coincidem.')
      return
    }
    try {
      await api.patch(`/usuarios/${usuarioId}/senha`, {
        senhaAtual: formSenha.senhaAtual,
        novaSenha:  formSenha.novaSenha,
      })
      setModalSenha(false)
      setFormSenha({ senhaAtual: '', novaSenha: '', confirmar: '' })
      avisar('Senha alterada com sucesso')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErroSenha(err?.response?.data?.message ?? 'Erro ao alterar senha.')
    }
  }

  // ── Avatar ──
  const handleAvatarSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    try {
      const formData = new FormData()
      formData.append('avatar', ficheiro)
      await api.patch(`/usuarios/${usuarioId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      carregarPerfil()
      avisar('Foto de perfil actualizada')
    } catch {
      avisar('Erro ao actualizar foto de perfil')
    } finally {
      e.target.value = ''
    }
  }

  // ── 2FA ──
  const abrirTotp = async () => {
    setErroTotp('')
    setTotpCodigo('')
    if (perfil?.totpAtivo) {
      setModalTotp(true)
      return
    }
    try {
      const res = await api.post(`/usuarios/${usuarioId}/totp/gerar`)
      setTotpDados(res.data.data)
      setModalTotp(true)
    } catch {
      avisar('Erro ao gerar segredo 2FA')
    }
  }

  const ativarTotp = async () => {
    if (!totpDados) return
    try {
      await api.post(`/usuarios/${usuarioId}/totp/ativar`, { segredo: totpDados.segredo, codigo: totpCodigo })
      setModalTotp(false)
      carregarPerfil()
      avisar('Autenticação em dois factores activada')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErroTotp(err?.response?.data?.message ?? 'Código inválido')
    }
  }

  const desativarTotp = async () => {
    try {
      await api.delete(`/usuarios/${usuarioId}/totp`)
      setModalTotp(false)
      carregarPerfil()
      avisar('Autenticação em dois factores desactivada')
    } catch {
      avisar('Erro ao desactivar 2FA')
    }
  }

  // ── Sessões ──
  const abrirSessoes = async () => {
    try {
      const res = await api.get(`/usuarios/${usuarioId}/sessoes`)
      setSessoes(res.data.data)
      setModalSessoes(true)
    } catch {
      avisar('Erro ao carregar sessões')
    }
  }

  const encerrarSessao = async (sessaoId: string) => {
    try {
      await api.delete(`/usuarios/${usuarioId}/sessoes/${sessaoId}`)
      setSessoes((prev) => prev.filter((s) => s.id !== sessaoId))
    } catch {
      avisar('Erro ao encerrar sessão')
    }
  }

  // ── Notificação por email ──
  const alternarNotificacao = async () => {
    if (!perfil) return
    try {
      await api.patch(`/usuarios/${usuarioId}/notificacao`, { ativa: !perfil.notificacaoEmailAtiva })
      carregarPerfil()
      avisar('Preferência de notificação actualizada')
    } catch {
      avisar('Erro ao actualizar notificação')
    }
  }

  // ── Empresa / plataforma ──
  const abrirEmpresa = () => {
    setFormEmpresa({ nome: plataforma.nome, idioma: plataforma.idioma })
    setModalEmpresa(true)
  }

  const salvarEmpresa = async () => {
    try {
      await api.patch('/plataforma', formEmpresa)
      setModalEmpresa(false)
      carregarPlataforma()
      avisar('Configurações da plataforma actualizadas')
    } catch {
      avisar('Erro ao actualizar configurações')
    }
  }

  const handleLogoSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    try {
      const formData = new FormData()
      formData.append('logotipo', ficheiro)
      await api.patch('/plataforma/logotipo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      carregarPlataforma()
      avisar('Logotipo actualizado')
    } catch {
      avisar('Erro ao actualizar logotipo')
    } finally {
      e.target.value = ''
    }
  }

  // ── Backup / restauração ──
  const exportarBackup = async () => {
    try {
      const res = await api.get('/backup/exportar', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      avisar('Erro ao exportar backup')
    }
  }

  const restaurarBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiro = e.target.files?.[0]
    if (!ficheiro) return
    if (!confirm('Restaurar um backup vai sobrepor dados existentes com o mesmo ID. Continuar?')) {
      e.target.value = ''
      return
    }
    try {
      const formData = new FormData()
      formData.append('ficheiro', ficheiro)
      await api.post('/backup/restaurar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      avisar('Backup restaurado com sucesso')
    } catch {
      avisar('Erro ao restaurar backup')
    } finally {
      e.target.value = ''
    }
  }

  const contaSeguranca = [
    { title: "Alterar senha", description: "Atualize sua senha de acesso.", actionLabel: "Alterar", onAction: () => setModalSenha(true) },
    { title: "Autenticação em dois fatores", description: perfil?.totpAtivo ? "Activa — clica para gerir." : "Adicione uma camada extra de segurança.", actionLabel: perfil?.totpAtivo ? "Gerir" : "Ativar", onAction: abrirTotp },
    { title: "Sessões ativas", description: "Veja e encerre logins ativos.", actionLabel: "Gerir", onAction: abrirSessoes },
  ];

  const perfilAdministrador = [
    { title: "Nome do administrador", description: "Atualiza o nome exibido.", actionLabel: "Editar", onAction: abrirEditarPerfil },
    { title: "Email da conta", description: "Gerenciar o endereço de email usado.", actionLabel: "Editar", onAction: abrirEditarPerfil },
    { title: "Foto de perfil", description: "Alterar a imagem de exibição.", actionLabel: "Atualizar", onAction: () => avatarInputRef.current?.click() },
  ];

  const empresa = [
    { title: "Nome da empresa", description: "Atualize o nome principal.", actionLabel: "Editar", onAction: abrirEmpresa },
    { title: "Logotipo", description: "Atualize o logotipo usado no painel.", actionLabel: "Carregar imagem", onAction: () => logoInputRef.current?.click() },
    { title: "Idioma e região", description: "Defina o idioma e formato da data.", actionLabel: "Configurar", onAction: abrirEmpresa },
  ];

  const sistemaAparencia = [
    { title: "Tema escuro/claro", description: `Modo actual: ${tema === 'dark' ? 'Escuro' : 'Claro'}.`, actionLabel: "Alterar", onAction: () => aplicarTema(tema === 'dark' ? 'light' : 'dark') },
    { title: "Notificação", description: perfil?.notificacaoEmailAtiva ? "Alertas por email activos." : "Alertas por email desactivados.", actionLabel: "Gerir", onAction: alternarNotificacao },
    { title: "Backup e restauração", description: "Baixe ou restaure configurações salvas.", actionLabel: "Acessar", onAction: exportarBackup },
  ];

  return (
    <>
      <Sidebar>
        <Container titulo="Definições" notificacao={<Bell size={20} />} usuario={perfil?.nome ?? '...'}>

          {mensagem && (
            <div className="mb-4 p-3 rounded-lg bg-green-600/20 border border-green-600 text-green-400 text-sm">{mensagem}</div>
          )}

          {/* Grid de cards 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <CardDef cardTitle="Conta e Segurança" items={contaSeguranca} />
            <CardDef cardTitle="Perfil do Administrador" items={perfilAdministrador} />
            <CardDef cardTitle="Empresa" items={empresa} />
            <CardDef cardTitle="Sistema e Aparência" items={sistemaAparencia} />
          </div>

          {/* Restaurar backup (input oculto, disparado pelo botão do card) */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => restaurarInputRef.current?.click()}
              className="px-6 py-2 bg-[#040928] hover:bg-[#1a2942] text-white font-medium rounded-lg transition-colors border border-[#050e4c]"
            >
              Restaurar backup
            </button>
          </div>

          <input ref={avatarInputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleAvatarSelecionado} />
          <input ref={logoInputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleLogoSelecionado} />
          <input ref={restaurarInputRef} type="file" accept=".json" className="hidden" onChange={restaurarBackup} />

        </Container>
      </Sidebar>

      {/* Modal editar perfil */}
      {modalPerfil && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Editar Perfil</h2>
            {erroPerfil && <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroPerfil}</div>}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Nome</label>
                <input value={formPerfil.nome} onChange={(e) => setFormPerfil((p) => ({ ...p, nome: e.target.value }))}
                  className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Email</label>
                <input value={formPerfil.email} onChange={(e) => setFormPerfil((p) => ({ ...p, email: e.target.value }))}
                  className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={salvarPerfil} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">Guardar</button>
              <button onClick={() => setModalPerfil(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal alterar senha */}
      {modalSenha && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Alterar Senha</h2>
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

            {perfil?.totpAtivo ? (
              <>
                <p className="text-gray-300 text-sm mb-6">A autenticação em dois factores está activa nesta conta.</p>
                <div className="flex gap-3">
                  <button onClick={desativarTotp} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm">Desactivar</button>
                  <button onClick={() => setModalTotp(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">Fechar</button>
                </div>
              </>
            ) : (
              <>
                {erroTotp && <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroTotp}</div>}
                <p className="text-gray-300 text-sm mb-3">Digitaliza o código com a tua aplicação autenticadora (Google Authenticator, Authy, etc.):</p>
                {totpDados?.qrDataUrl && (
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal sessões ativas */}
      {modalSessoes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Sessões Ativas</h2>
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
              {sessoes.length === 0 && <p className="text-gray-400 text-sm">Nenhuma sessão activa.</p>}
              {sessoes.map((s) => (
                <div key={s.id} className="flex items-center justify-between border border-[#050e4c] rounded-lg p-3">
                  <div>
                    <p className="text-white text-sm">{s.userAgent ?? 'Dispositivo desconhecido'}</p>
                    <p className="text-gray-500 text-xs">{s.ip ?? '-'} · último uso {new Date(s.ultimoUso).toLocaleString('pt-PT')}</p>
                  </div>
                  <button onClick={() => encerrarSessao(s.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Encerrar</button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalSessoes(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal configurações da empresa/plataforma */}
      {modalEmpresa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Configurações da Plataforma</h2>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Nome da plataforma</label>
                <input value={formEmpresa.nome} onChange={(e) => setFormEmpresa((p) => ({ ...p, nome: e.target.value }))}
                  className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Idioma e região</label>
                <select value={formEmpresa.idioma} onChange={(e) => setFormEmpresa((p) => ({ ...p, idioma: e.target.value }))}
                  className="outline-none py-2.5 px-4 border border-[#050e4c] rounded-lg bg-[#03031b] text-white text-sm focus:border-blue-500">
                  <option value="pt-PT">Português (Portugal/Angola)</option>
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={salvarEmpresa} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">Guardar</button>
              <button onClick={() => setModalEmpresa(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm border border-white/10">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
