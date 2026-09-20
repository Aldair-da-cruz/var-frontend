import { Pencil, ToggleLeft, ToggleRight, Circle, Power } from 'lucide-react';

export interface Empresa {
    empresa: string
    designacao: string
    local: string
    funcionarios: number
    status: "Ativo" | "Inativo"
    alertas: number
    onEditar?: () => void
    onAtivar?: () => void
    onDesativar?: () => void
}

interface Tabela8Props {
  dados: Empresa[];
}

export default function Tabela8({dados}: Tabela8Props) {
    const statusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "text-green-400";
      case "Inativo": return "text-gray-400";
      default: return "text-gray-300";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "Ativo": return <Circle size={10} className="fill-green-400 text-green-400" />;
      case "Inativo": return <Power size={12} className="text-gray-400" />;
      default: return null;
    }
  };
  
    return(
      <div className="w-full rounded-2xl mt-2">
        <table className="w-full text-left text-white border-collapse rounded-2xl">
          <thead className="sticky top-0 z-10 backdrop-blur-sm">
            <tr className="text-gray-200 border-b-2 border-[#050e4c]">
              <th className="py-3 px-4 text-lg font-light">Empresa</th>
              <th className="py-3 px-4 text-lg font-light">Email</th>
              <th className="py-3 px-4 text-lg font-light">NIF</th>
              <th className="py-3 px-4 text-lg font-light">Funcionários</th>
              <th className="py-3 px-4 text-lg font-light">Status</th>
              <th className="py-3 px-4 text-lg font-light">Alertas</th>
              <th className="py-3 px-4 text-lg text-center font-light">Ações</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((item, index) => (
              <tr key={index} className="border-b border-[#050e4c] hover:bg-white/10 transition-colors duration-200">
                <td className="py-3 px-4 text-sm font-light">{item.empresa}</td>
                <td className="py-3 px-4 text-sm font-light">{item.designacao}</td>
                <td className="py-3 px-4 text-sm font-light">{item.local}</td>
                <td className="py-3 px-4 text-sm font-light">{item.funcionarios}</td>
                <td className={`py-3 px-4 font-light text-sm ${statusColor(item.status)}`}>
                  <div className="flex items-center gap-1.5">
                    {statusIcon(item.status)}
                    {item.status}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-light text-red-400">{item.alertas}</td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    {/* Editar */}
                    <button
                      onClick={item.onEditar}
                      title="Editar"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    {/* Ativar / Desativar */}
                    {item.status === "Ativo" ? (
                      <button
                        onClick={item.onDesativar}
                        title="Desativar"
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <ToggleRight size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={item.onAtivar}
                        title="Ativar"
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        <ToggleLeft size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
}