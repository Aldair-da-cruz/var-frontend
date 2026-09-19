import { Building2, FileText, Monitor, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface EmpresaItem {
  id: string
  nome: string
  nif: string
  _count?: {
    equipamentos?: number
    alertas?: number
  }
}

interface ListaEmpresasProps {
  empresas?: EmpresaItem[]
  titulo?: string
  visualizacao?: 'grelha' | 'coluna'
}

export default function ListaEmpresas({
  empresas = [],
  titulo = "Empresas com alertas",
  visualizacao = 'grelha'
}: ListaEmpresasProps) {

  return (
    <div className="w-full h-full p-4">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-gray-400" />
          <h2 className="text-white text-base font-semibold">{titulo}</h2>
        </div>
      </div>

      {/* GRID */}
      {visualizacao === 'grelha' && (
        <div className="grid grid-cols-3 gap-3">
          {empresas.map((empresa) => (
            <div
              key={empresa.id}
              className="bg-black/20 border border-gray-800 rounded-lg p-3"
            >

              <div className="flex flex-col items-center gap-2">

                <Building2 size={30} className="text-gray-400" />

                <p className="text-white font-medium text-center">
                  {empresa.nome}
                </p>

                <p className="text-gray-500 text-xs flex items-center gap-1">
                  <FileText size={10} />
                  NIF: {empresa.nif}
                </p>

                <p className="text-blue-400 text-xs flex items-center gap-1">
                  <Monitor size={10} />
                  {empresa._count?.equipamentos ?? 0} equipamentos
                </p>

                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertTriangle size={10} />
                  {empresa._count?.alertas ?? 0} alertas
                </p>

              </div>

              <Link
                href={`/operacional/gerir_alerta/equipamento/${empresa.id}`}
                className="block mt-3 text-center bg-purple-600/20 text-blue-400 rounded-lg py-2 text-sm"
              >
                Expandir
              </Link>

            </div>
          ))}
        </div>
      )}

      {/* COLUNA */}
      {visualizacao === 'coluna' && (
        <div className="flex flex-col gap-2">
          {empresas.map((empresa) => (
            <div
              key={empresa.id}
              className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-gray-800"
            >

              <div>
                <p className="text-white font-medium">{empresa.nome}</p>
                <p className="text-gray-500 text-xs">
                  NIF: {empresa.nif}
                </p>
              </div>

              <div className="flex gap-4 text-xs">

                <span className="text-blue-400 flex items-center gap-1">
                  <Monitor size={12} />
                  {empresa._count?.equipamentos ?? 0}
                </span>

                <span className="text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {empresa._count?.alertas ?? 0}
                </span>

              </div>

              <Link
                href={`/operacional/gerir_alerta/equipamento/${empresa.id}`}
                className="text-blue-400 text-sm"
              >
                Expandir
              </Link>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}