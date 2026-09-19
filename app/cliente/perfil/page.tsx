'use client'
import { useEffect, useState } from "react"
import AtividadesRecentes, { AtividadeRecente } from "@/components/actividadeRec"
import Container from "@/components/container"
import InformacoesEmpresa from "@/components/infoEmpresa"
import PerfilCliente from "@/components/perfilC"
import Permissoes from "@/components/permissao"
import Sidebar2 from "@/components/sidbar2"
import Tema from "@/components/tema"
import { Bell, X } from "lucide-react"
import { api } from "@/lib/api"
import Cookies from "js-cookie"

interface EmpresaAPI {
  id:       string
  nome:     string
  email:    string
  telefone: string | null
  cnpj:     string
  status:   string
}

interface UsuarioAPI {
  id:               string
  nome:             string
  email:            string
  papel:            string
  empresaId:        string | null
  permissaoAlertas: boolean
  permissaoGestao:  boolean
}

function humanizarAcao(acao: string): string {
  const [metodo, caminho] = acao.split(' ')
  const recurso = (caminho ?? '').replace('/api/v1/', '').split('/').filter(Boolean)[0] ?? 'sistema'
  const verbos: Record<string, string> = { POST: 'Criação em', PATCH: 'Atualização em', DELETE: 'Remoção em', GET: 'Consulta em' }
  return `${verbos[metodo] ?? 'Ação em'} ${recurso}`
}

export default function PerfilPage() {
  const [usuario,       setUsuario]       = useState<UsuarioAPI | null>(null)
  const [empresa,       setEmpresa]       = useState<EmpresaAPI | null>(null)
  const [atividades,    setAtividades]    = useState<AtividadeRecente[]>([])
  const [carregando,    setCarregando]    = useState(true)

  // Modal editar
  const [modalEditar,   setModalEditar]   = useState(false)
  const [formEditar,    setFormEditar]    = useState({ nome: '', email: '' })
  const [loadingEditar, setLoadingEditar] = useState(false)
  const [erroEditar,    setErroEditar]    = useState('')
  const [sucessoEditar, setSucessoEditar] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const raw = Cookies.get('usuario')
        if (!raw) return
        const u: UsuarioAPI = JSON.parse(raw)
        setUsuario(u)

        const promises: Promise<any>[] = []

        if (u.empresaId) {
          promises.push(
            api.get(`/empresas/${u.empresaId}`).then((res) => setEmpresa(res.data.data))
          )
          promises.push(
            api.get('/logs', { params: { empresaId: u.empresaId, limit: 20 } }).then((res) => {
              const logs = res.data?.data ?? []
              setAtividades(logs.map((l: any) => ({
                descricao: humanizarAcao(l.acao),
                data:      new Date(l.criadoEm).toLocaleDateString('pt-PT', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                }),
              })))
            })
          )
        }

        await Promise.allSettled(promises)
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const abrirEditar = () => {
    setFormEditar({ nome: usuario?.nome ?? '', email: usuario?.email ?? '' })
    setErroEditar('')
    setSucessoEditar(false)
    setModalEditar(true)
  }

  const salvarEditar = async () => {
    if (!usuario) return
    if (!formEditar.nome || !formEditar.email) {
      setErroEditar('Nome e email são obrigatórios.')
      return
    }
    try {
      setLoadingEditar(true)
      await api.patch(`/usuarios/${usuario.id}`, {
        nome:  formEditar.nome,
        email: formEditar.email,
      })

      // Actualiza o cookie com os novos dados
      const novoUsuario = { ...usuario, nome: formEditar.nome, email: formEditar.email }
      Cookies.set('usuario', JSON.stringify(novoUsuario), { path: '/' })
      setUsuario(novoUsuario)

      setSucessoEditar(true)
      setTimeout(() => setModalEditar(false), 1500)
    } catch (err: any) {
      setErroEditar(err?.response?.data?.message ?? 'Erro ao actualizar perfil.')
    } finally {
      setLoadingEditar(false)
    }
  }

  const handleTogglePermissao = async (chave: 'permissaoAlertas' | 'permissaoGestao', ativo: boolean) => {
    if (!usuario) return
    const anterior = usuario
    const atualizado = { ...usuario, [chave]: ativo }
    setUsuario(atualizado)
    try {
      await api.patch(`/usuarios/${usuario.id}/permissoes`, { [chave]: ativo })
      Cookies.set('usuario', JSON.stringify({ ...JSON.parse(Cookies.get('usuario') ?? '{}'), [chave]: ativo }), { path: '/' })
    } catch {
      setUsuario(anterior)
    }
  }

  const dataHoje = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <Sidebar2>
        <Container titulo="Perfil" notificacao={<Bell size={20} />} usuario={usuario?.nome ?? dataHoje}>

          {carregando ? (
            <div className="flex items-center justify-center h-64 text-gray-400">A carregar...</div>
          ) : (
            <>
              <div className="w-295 ml-3 mt-2 flex gap-3 mb-2">
                <div className="w-100 pb-3 border-[#050e4c] border rounded-2xl shadow-xl bg-[#040928]">
                  <PerfilCliente
                    empresa={empresa?.nome ?? '—'}
                    ramo={empresa?.cnpj ?? '—'}
                    contato={usuario?.nome ?? '—'}
                    email={usuario?.email ?? '—'}
                    status={empresa?.status === 'Ativo' ? 'Ativo' : 'Inativo'}
                    onEditar={abrirEditar}
                  />
                </div>
                <div className="w-195 pb-2 border-[#050e4c] border rounded-2xl shadow-xl bg-[#040928]">
                  <InformacoesEmpresa
                    nome={empresa?.nome ?? '—'}
                    telefone={empresa?.telefone ?? '—'}
                    endereco="—"
                    email={empresa?.email ?? '—'}
                  />
                </div>
              </div>

              <div className="w-295 ml-3 mt-1 flex gap-3">
                <div className="w-100 h-2.5 flex flex-col gap-3">
                  <Permissoes
                    permissoes={[
                      { chave: 'permissaoAlertas', nome: 'Permissão para alertas',       ativo: usuario?.permissaoAlertas ?? true },
                      { chave: 'permissaoGestao',  nome: 'Permissão de acesso à gestão', ativo: usuario?.permissaoGestao  ?? true },
                    ]}
                    onToggle={handleTogglePermissao}
                  />
                  <Tema />
                </div>
                <div className="w-195 p-3 border-[#050e4c] border rounded-2xl shadow-xl bg-[#040928]">
                  <AtividadesRecentes atividades={atividades.length > 0 ? atividades : [
                    { descricao: 'Sem actividades recentes', data: '—' }
                  ]} />
                </div>
              </div>
            </>
          )}
        </Container>
      </Sidebar2>

      {/* Modal Editar Perfil */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#040928] border border-[#050e4c] rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
              <button onClick={() => setModalEditar(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {erroEditar && (
              <div className="mb-3 p-2 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erroEditar}</div>
            )}

            {sucessoEditar ? (
              <div className="py-6 text-center">
                <p className="text-green-400 text-sm">✓ Perfil actualizado com sucesso!</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Nome',  campo: 'nome',  type: 'text'  },
                    { label: 'Email', campo: 'email', type: 'email' },
                  ].map(({ label, campo, type }) => (
                    <div key={campo} className="flex flex-col gap-1">
                      <label className="text-sm text-gray-400">{label}</label>
                      <input
                        type={type}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}