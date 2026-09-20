import { Search } from 'lucide-react';

interface FiltrosEmpresasProps {
  status?: 'Ativo' | 'Inativo';
  onStatusChange?: (status: 'Ativo' | 'Inativo') => void;
  onSearchChange?: (search: string) => void;
}

export default function FiltrosEmpresas({
  status = 'Ativo',
  onStatusChange,
  onSearchChange
}: FiltrosEmpresasProps) {
  return (
    <div className="w-full p-4 mb-4">
      <div className="flex items-center gap-6">
        {/* Toggle Status */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-gray-400 text-xs mb-1">Status</label>
          <div className="flex gap-1 bg-[#040928] border border-[#1a2942] rounded-lg p-1 w-[200px]">
            {(['Ativo', 'Inativo'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange?.(s)}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm transition-colors ${status === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Campo de Pesquisa */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-gray-400 text-xs mb-1">Pesquisar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="pesquisar empresa..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-[280px] bg-[#040928] text-white border border-[#1a2942] rounded-lg pl-10 pr-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
