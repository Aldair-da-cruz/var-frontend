import { Search } from 'lucide-react';

interface FiltrosFuncionariosProps {
  onStatusChange?: (status: string) => void;
  onCargoChange?: (cargo: string) => void;
  onSearchChange?: (search: string) => void;
  onNovoFuncionario?: () => void;
  cargos?: string[];
}

export default function FiltrosFuncionarios({
  onStatusChange,
  onCargoChange,
  onSearchChange,
  onNovoFuncionario,
  cargos = []
}: FiltrosFuncionariosProps) {
  return (
    <div className="w-[1180px] rounded-2xl  mb-10 mt-3 ml-3">
      <div className="flex flex-wrap items-center justify-between">
       
        <div className='flex gap-3'>
 {/* Select Status */}
            <div className=" w-[150px]">
          <label className="block text-gray-400 text-xs mb-1">Status</label>
          <select 
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="w-full  text-white bg-[#040928]  border border-[#050e4c] rounded-lg px-3 py-2 text-sm outline-none t"
          >
            <option value="">Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>

        {/* Select Cargo */}
        <div className="w-[150px]">
          <label className="block text-gray-400 text-xs mb-1">Cargo</label>
          <select 
            onChange={(e) => onCargoChange?.(e.target.value)}
            className="w-full  text-white bg-[#040928]  border border-[#050e4c] rounded-lg px-3 py-2 text-sm outline-none "
          >
            <option value="">Todos</option>
            {cargos.map((cargo) => (
              <option key={cargo} value={cargo}>{cargo}</option>
            ))}
          </select>
        </div>

        {/* Campo de Pesquisa */}
        <div className="w-[250px]">
          <label className="block text-gray-400 text-xs mb-1">Pesquisar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="pesquisar funcionário..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full  text-white   border border-[#050e4c] rounded-lg pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        </div>

        {/* Botão Novo Funcionário */}
        <div className="min-w-[150px]">
          <label className="block text-gray-400 text-xs mb-1 opacity-0">Ação</label>
          <button
            onClick={onNovoFuncionario}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span>
            Novo Funcionário
          </button>
        </div>
      </div>
    </div>
  );
}