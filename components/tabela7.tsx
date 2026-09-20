import { Download } from 'lucide-react'

export interface Pagamento {
  id?:         string
  data:        string
  valor:       string
  chaveLicenca: string
  metodo:      string
  status:      'Pago' | 'Pendente' | 'Reembolsado'
  onBaixarPDF?: () => void
}

interface Tabela7Props {
  dados: Pagamento[]
}

export default function Tabela7({ dados }: Tabela7Props) {
  const statusColor = (status: string) => {
    switch (status) {
      case 'Pago':        return 'text-green-400'
      case 'Pendente':    return 'text-yellow-400'
      case 'Reembolsado': return 'text-blue-400'
      default:            return 'text-gray-300'
    }
  }

  return (
    <div className="w-full rounded-2xl mt-2">
      <table className="w-full text-left text-white border-collapse rounded-2xl">
        <thead className="sticky top-0 z-10 backdrop-blur-sm">
          <tr className="text-gray-200 border-b-2 border-[#050e4c]">
            <th className="py-3 px-4 text-lg font-light">Data</th>
            <th className="py-3 px-4 text-lg font-light">Valor</th>
            <th className="py-3 px-4 text-lg font-light">Chave da licença</th>
            <th className="py-3 px-4 text-lg font-light">Método</th>
            <th className="py-3 px-4 text-lg font-light">Status</th>
            <th className="py-3 px-4 text-lg text-center font-light">Recibo</th>
          </tr>
        </thead>
        <tbody>
          {dados.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Nenhum pagamento encontrado.</td>
            </tr>
          ) : dados.map((item, index) => (
            <tr key={index} className="border-b border-[#050e4c] hover:bg-white/10 transition-colors duration-200">
              <td className="py-3 px-4 text-sm font-light">{item.data}</td>
              <td className="py-3 px-4 text-sm font-light">{item.valor}</td>
              <td className="py-3 px-4 text-sm font-light">{item.chaveLicenca}</td>
              <td className="py-3 px-4 text-sm font-light">{item.metodo}</td>
              <td className={`py-3 px-4 font-light text-sm ${statusColor(item.status)}`}>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'Pago'     ? 'bg-green-600/20 text-green-400'  :
                  item.status === 'Pendente' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-blue-600/20 text-blue-400'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <button onClick={item.onBaixarPDF}
                  className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto text-sm">
                  <Download size={16} />
                  <span>Baixar PDF</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}