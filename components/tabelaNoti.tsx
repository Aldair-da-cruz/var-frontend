'use client'
import { useState } from 'react'
import { ChevronDown, X, Download, Circle, Power } from 'lucide-react'
import { api } from '@/lib/api'

export interface Notificacao {
  id: number
  empresa: string
  licenca: string
  chaveLicenca: string
  valor: string
  metodoPagamento: string
  status: string
  data: string
  onAceitar?: () => void
  onRecusar?: () => void
}

export interface DadosPagamento {
  id:              string
  empresa:         string
  licenca:         string
  valor:           number
  date:            string
  status:          string
  metodoPagamento: string
  onAceitar?:      () => void
  onRecusar?:      () => void
  onPendente?:     () => void
}

interface TabelaNotificacoesProps {
  dados: Notificacao[]
  dados2?: DadosPagamento[]
}

export default function TabelaNotificacoes({ dados, dados2 }: TabelaNotificacoesProps) {
  const [modalAberto,    setModalAberto]    = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState<DadosPagamento | null>(null)
  const [dropdownAberto, setDropdownAberto] = useState<number | null>(null)

  const abrirModal = (item: DadosPagamento) => {
    setItemSelecionado(item)
    setModalAberto(true)
  }

  const baixarFatura = async (id: string) => {
    try {
      const res = await api.get(`/pagamentos/${id}/fatura`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `fatura_${id.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao baixar fatura.')
    }
  }

  const fecharModal = () => {
    setModalAberto(false)
    setItemSelecionado(null)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'Pago':      case 'Concluido': return 'text-green-400'
      case 'Pendente':                   return 'text-yellow-400'
      case 'Recusado':  case 'Reembolsado': return 'text-red-400'
      default:                           return 'text-gray-300'
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'Pago':    return <Circle size={10} className="fill-green-400 text-green-400" />
      case 'Recusado': return <Power size={12} className="text-red-500" />
      default:         return null
    }
  }

  // ── Tabela de Pagamentos ──
  if (dados2) {
    return (
      <>
        <div className="w-full rounded-2xl">
          <table className="w-full text-left text-white border-collapse">
            <thead>
              <tr className="text-gray-200 border-b-2 border-[#050e4c]">
                <th className="py-3 px-4 text-lg font-light">Empresa</th>
                <th className="py-3 px-4 text-lg font-light">Plano/Licença</th>
                <th className="py-3 px-4 text-lg font-light">Valor</th>
                <th className="py-3 px-4 text-lg font-light">Data</th>
                <th className="py-3 px-4 text-lg font-light">Status</th>
                <th className="py-3 px-4 text-lg font-light">Referência</th>
                <th className="py-3 px-4 text-lg font-light text-center">Acções</th>
              </tr>
            </thead>
            <tbody>
              {dados2.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">Nenhum pagamento encontrado.</td>
                </tr>
              ) : dados2.map((item, index) => (
                <tr key={index} className="border-b border-[#050e4c] hover:bg-white/10 transition-colors">
                  <td className="py-3 px-4 text-sm font-light">{item.empresa}</td>
                  <td className="py-3 px-4 text-sm font-light">{item.licenca}</td>
                  <td className="py-3 px-4 text-sm font-light">AOA {item.valor.toLocaleString('pt-PT')}</td>
                  <td className="py-3 px-4 text-sm font-light">{item.date}</td>
                  <td className={`py-3 px-4 text-sm font-light flex items-center gap-1.5 ${statusColor(item.status)}`}>
                    {statusIcon(item.status)}
                    {item.status}
                  </td>
                  <td className="py-3 px-4 text-sm font-light">{item.metodoPagamento}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => abrirModal(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Detalhes */}
        {modalAberto && itemSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={fecharModal}>
            <div className="bg-[#0a1240] border border-[#1a2a80] rounded-2xl p-7 w-[500px] max-w-[95vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-base font-semibold">Detalhes — {itemSelecionado.empresa}</h2>
                <button onClick={fecharModal} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: 'Empresa', value: itemSelecionado.empresa },
                  { label: 'Plano / licença', value: itemSelecionado.licenca },
                  { label: 'Valor', value: `AOA ${itemSelecionado.valor.toLocaleString('pt-PT')}` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[#8899cc] text-xs mb-1.5">{label}</p>
                    <div className="bg-[#040928] border border-[#1a2a80] rounded-lg px-3 py-2 text-white text-sm">{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-[#8899cc] text-xs mb-1.5">Referência</p>
                  <div className="bg-[#040928] border border-[#1a2a80] rounded-lg px-3 py-2 text-white text-sm">{itemSelecionado.metodoPagamento}</div>
                </div>
                <div>
                  <p className="text-[#8899cc] text-xs mb-1.5">Data do pagamento</p>
                  <div className="bg-[#040928] border border-[#1a2a80] rounded-lg px-3 py-2 text-white text-sm">{itemSelecionado.date}</div>
                </div>
              </div>

              <div className={`mb-6 flex items-center gap-2 ${statusColor(itemSelecionado.status)}`}>
                {statusIcon(itemSelecionado.status)}
                <span className="text-sm font-medium">{itemSelecionado.status}</span>
              </div>

              {/* Acções no modal */}
              <div className="flex gap-2 mb-4">
                {itemSelecionado.status !== 'Pago' && (
                  <button onClick={() => { itemSelecionado.onAceitar?.(); fecharModal() }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm">
                    Aceitar
                  </button>
                )}
                {itemSelecionado.status !== 'Recusado' && (
                  <button onClick={() => { itemSelecionado.onRecusar?.(); fecharModal() }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm">
                    Recusar
                  </button>
                )}
                {itemSelecionado.status !== 'Pendente' && (
                  <button onClick={() => { itemSelecionado.onPendente?.(); fecharModal() }}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm">
                    Pendente
                  </button>
                )}
              </div>

              <button
                onClick={() => baixarFatura(itemSelecionado.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Baixar fatura
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // ── Tabela de Notificações (pendentes) ──
  return (
    <div className="w-full rounded-2xl">
      <table className="w-full text-left text-white border-collapse">
        <thead>
          <tr className="text-gray-200 border-b-2 border-[#050e4c]">
            <th className="py-3 px-4 text-lg font-light">Empresa</th>
            <th className="py-3 px-4 text-lg font-light">Licença</th>
            <th className="py-3 px-4 text-lg font-light">Referência</th>
            <th className="py-3 px-4 text-lg font-light">Valor</th>
            <th className="py-3 px-4 text-lg font-light">Método</th>
            <th className="py-3 px-4 text-lg font-light">Status</th>
            <th className="py-3 px-4 text-lg font-light">Data</th>
            <th className="py-3 px-4 text-lg font-light text-center">Acção</th>
          </tr>
        </thead>
        <tbody>
          {dados.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-gray-500 text-sm">Sem pagamentos pendentes.</td>
            </tr>
          ) : dados.map((item) => (
            <tr key={item.id} className="border-b border-[#050e4c] hover:bg-white/10 transition-colors">
              <td className="py-3 px-4 text-sm font-light">{item.empresa}</td>
              <td className="py-3 px-4 text-sm font-light">{item.licenca}</td>
              <td className="py-3 px-4 text-sm font-light">{item.chaveLicenca}</td>
              <td className="py-3 px-4 text-sm font-light">AOA {item.valor}</td>
              <td className="py-3 px-4 text-sm font-light">{item.metodoPagamento}</td>
              <td className={`py-3 px-4 text-sm font-light ${statusColor(item.status)}`}>{item.status}</td>
              <td className="py-3 px-4 text-sm font-light">{item.data}</td>
              <td className="py-3 px-4 text-center relative">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={item.onAceitar}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors">
                    Aceitar
                  </button>
                  <button onClick={item.onRecusar}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors">
                    Recusar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}