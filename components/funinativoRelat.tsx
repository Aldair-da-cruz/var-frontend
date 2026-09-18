'use client'

import { UserX, Building2, MapPin, Calendar, Trash2, MoreHorizontal, Eye, UserMinus } from 'lucide-react';

interface FuncionarioInativo {
  id?: string;
  nome: string;
  empresa?: string | { id: string; nome: string };
  cargo?: string;
  local?: string;
  status: string;
  criadoEm: string;
}

interface FuncionariosInativosProps {
  dados: FuncionarioInativo[];
  loading?: boolean;
}

export default function FuncionariosInativos({
  dados = [],
  loading = false
}: FuncionariosInativosProps) {

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Inativo": return "text-gray-400 bg-gray-500/10";
      case "Suspenso": return "text-orange-400 bg-orange-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Inativo": return <UserX size={12} className="text-gray-400" />;
      case "Suspenso": return <UserMinus size={12} className="text-orange-400" />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-75 bg-[#040928] border border-[#050e4c] rounded-2xl p-4 flex flex-col">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <UserX size={18} className="text-gray-400" />
        <h2 className="text-white text-lg font-semibold">
          Funcionários Inativos/Suspensos
        </h2>
      </div>

      {/* HEADER TABELA */}
      <div className="grid grid-cols-6 gap-2 mb-2 px-2 shrink-0">
        <span className="text-gray-500 text-xs">Funcionário</span>
        <span className="text-gray-500 text-xs">Empresa/Cargo</span>
        <span className="text-gray-500 text-xs">Local</span>
        <span className="text-gray-500 text-xs">Status</span>
        <span className="text-gray-500 text-xs">Desde</span>
        <span className="text-gray-500 text-xs text-center">Ações</span>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">

        {loading && (
          <div className="text-gray-400 text-sm p-4">
            Carregando funcionários...
          </div>
        )}

        {!loading && dados.length === 0 && (
          <div className="text-gray-500 text-sm p-4">
            Nenhum funcionário encontrado
          </div>
        )}

        <div className="space-y-1 pr-1">
          {dados.map((item, index) => (
            <div
              key={item.id ?? index}
              className="grid grid-cols-6 gap-2 px-2 py-2 hover:bg-white/5 rounded-lg"
            >

              {/* nome */}
              <div className="col-span-1 text-white text-xs truncate">
                {item.nome}
              </div>

              {/* empresa/cargo */}
              <div className="col-span-1 text-gray-300 text-xs truncate">
                {typeof item.empresa === 'string' ? item.empresa : item.empresa?.nome} - {item.cargo}
              </div>

              {/* local */}
              <div className="col-span-1 text-gray-300 text-xs">
                {item.local}
              </div>

              {/* status */}
              <div className="col-span-1">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="text-xs">{item.status}</span>
                </div>
              </div>

              {/* data */}
              <div className="col-span-1 text-gray-400 text-xs">
                {new Date(item.criadoEm).toLocaleString()}
              </div>

              {/* ações */}
              <div className="col-span-1 flex justify-center gap-2">
                <button className="text-gray-500 hover:text-blue-400">
                  <Eye size={14} />
                </button>
                <button className="text-gray-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
                <button className="text-gray-500 hover:text-gray-300">
                  <MoreHorizontal size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between">
        <span className="text-gray-500 text-xs">
          Total: {dados.length}
        </span>
      </div>

    </div>
  );
}