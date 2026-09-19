'use client'
import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface Atividade {
  tipo: "login" | "logout" | "sistema";
  descricao: string;
  sistema: string;
  hora?: string;
  status: "sucesso" | "info";
}

interface AtividadesRecentesProps {
  atividades?: Atividade[];
}

export default function AtividadesRecentes({ atividades = [] }: AtividadesRecentesProps) {

  const [tabAtiva, setTabAtiva] = useState<'logins' | 'sistema'>('logins');

  const atividadesFiltradas = atividades.filter(a =>
    tabAtiva === 'logins' ? (a.tipo === 'login' || a.tipo === 'logout') : a.tipo === 'sistema'
  );

  const getIcon = (atividade: Atividade) => {
    if (atividade.status === "info") {
      return <Circle size={14} className="text-green-500 fill-green-500 flex-shrink-0" />;
    }
    return <CheckCircle size={14} className="text-green-500 flex-shrink-0" />;
  };

  return (
    <div className="w-full h-full p-4 shadow-xl bg-[#040928] border border-[#050e4c] rounded-2xl flex flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-base font-semibold">Atividades Recentes</h2>
      </div>

      {/* Tabs de alternância Logins / Sistema */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTabAtiva('logins')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            tabAtiva === 'logins'
              ? 'bg-blue-600 text-white'
              : 'bg-[#1a2a80] text-gray-400 hover:text-white'
          }`}
        >
          Logins
        </button>
        <button
          onClick={() => setTabAtiva('sistema')}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            tabAtiva === 'sistema'
              ? 'bg-blue-600 text-white'
              : 'bg-[#1a2a80] text-gray-400 hover:text-white'
          }`}
        >
          Sistema
        </button>
      </div>

      {/* Subtítulos das colunas */}
      <div className="grid grid-cols-12 gap-2 mb-2 px-2">
        <div className="col-span-1"></div>
        <div className="col-span-6">
          <span className="text-gray-500 text-xs">{tabAtiva === 'logins' ? 'Logins' : 'Alterações no sistema'}</span>
        </div>
        <div className="col-span-3">
          <span className="text-gray-500 text-xs">Sistema</span>
        </div>
        <div className="col-span-2"></div>
      </div>

      {/* Lista de atividades */}
      <div className="flex-1 space-y-1">
        {atividadesFiltradas.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-4">Sem atividades para mostrar</p>
        ) : (
          atividadesFiltradas.map((atividade, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center px-2 py-2 hover:bg-white/5 rounded-lg transition-colors border-b border-gray-700">
              {/* Ícone - alinhado e sem espaçamento excessivo */}
              <div className="col-span-1 flex items-center justify-center">
                {getIcon(atividade)}
              </div>
              
              {/* Descrição */}
              <div className="col-span-6">
                <span className="text-white text-xs">{atividade.descricao}</span>
              </div>
              
              {/* Sistema */}
              <div className="col-span-3">
                <span className="text-gray-400 text-xs">{atividade.sistema}</span>
              </div>
              
              {/* Hora */}
              <div className="col-span-2 text-right">
                {atividade.hora && (
                  <span className="text-gray-500 text-xs">{atividade.hora}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
