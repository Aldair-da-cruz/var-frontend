'use client';
import { AlertTriangle, Building2, Calendar } from 'lucide-react';

export interface AlertaItem {
  empresa: string;
  designacao: string;
  categoria: "Grave" | "Médio" | "Leve";
  data: string;
}

interface AlertasRecentesProps {
  alertas?: AlertaItem[];
}

export default function AlertasRecentes({ alertas = [] }: AlertasRecentesProps) {

  const getCategoriaColor = (categoria: string) => {
    switch(categoria) {
      case "Grave": return "text-red-500 bg-red-500/10";
      case "Médio": return "text-yellow-500 bg-yellow-500/10";
      case "Leve": return "text-green-500 bg-green-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="w-full h-[240px] bg-[#040928] border border-[#050e4c] rounded-2xl p-4 flex flex-col">
      {/* Cabeçalho (fixo) */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" />
          <h2 className="text-white text-lg font-semibold">Alertas recentes</h2>
        </div>
      </div>

      {/* Cabeçalho da tabela (fixo) */}
      <div className="grid grid-cols-4 gap-2 mb-2 px-2 flex-shrink-0">
        <span className="text-gray-500 text-xs font-medium">Empresa</span>
        <span className="text-gray-500 text-xs font-medium">Designação</span>
        <span className="text-gray-500 text-xs font-medium">Categoria</span>
        <span className="text-gray-500 text-xs font-medium">Data</span>
      </div>

      {/* Linhas da tabela com scroll invisível */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="space-y-1 pr-1">
          {alertas.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-4">Nenhum alerta recente.</p>
          )}
          {alertas.map((alerta, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
              <div className="flex items-center gap-1">
                <Building2 size={12} className="text-gray-500" />
                <span className="text-white text-xs">{alerta.empresa}</span>
              </div>
              <span className="text-gray-300 text-xs">{alerta.designacao}</span>
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoriaColor(alerta.categoria)}`}>
                  {alerta.categoria}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={10} className="text-gray-500" />
                <span className="text-gray-400 text-xs">{alerta.data}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}