import { AlertTriangle, Camera, Zap, Clock } from 'lucide-react';

export interface AlertaItem {
  id: string;
  titulo: string;
  descricao?: string;
  tempo: string;
  unidade?: string;
  resolvido: boolean;
}

export interface GrupoAlertas {
  periodo: "Hoje" | "Ontem" | "Esta semana" | "Mais antigos";
  itens: AlertaItem[];
}

interface ListaAlertasProps {
  grupos?: GrupoAlertas[];
  onResolver?: (id: string) => void;
  onVerDetalhes?: (item: AlertaItem) => void;
}

export default function ListaAlertas({ grupos = [], onResolver, onVerDetalhes }: ListaAlertasProps) {

  const getIcon = (titulo: string) => {
    if (titulo.toLowerCase().includes("câmera") || titulo.toLowerCase().includes("camera")) return <Camera size={16} className="text-yellow-500" />;
    if (titulo.toLowerCase().includes("elétric") || titulo.toLowerCase().includes("energia")) return <Zap size={16} className="text-orange-500" />;
    return <AlertTriangle size={16} className="text-red-500" />;
  };

  return (
    <div className="w-full h-full p-4 ">
      <h2 className="text-white text-xl font-semibold mb-4">Alertas</h2>

      {grupos.every((g) => g.itens.length === 0) && (
        <p className="text-gray-500 text-sm">Nenhum alerta encontrado.</p>
      )}

      <div className="space-y-6 w-full  flex flex-col rounded-lg">
        {grupos.filter((g) => g.itens.length > 0).map((grupo, grupoIndex) => (
          <div key={grupoIndex}>
            {/* Título do período */}
            <h3 className="text-gray-400 text-sm font-medium mb-3">{grupo.periodo}</h3>

            {/* Itens do período */}
            <div className="space-y-4 flex flex-col gap-2 w-full">
              {grupo.itens.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onVerDetalhes?.(item)}
                  className="border-l-2 border-gray-700 pl-3 bg-white/5 hover:bg-white/10 shadow-lg rounded-md p-3 w-full cursor-pointer transition-colors"
                >
                  {/* Título e ícone */}
                  <div className="flex items-start gap-2 mb-1">
                    {getIcon(item.titulo)}
                    <span className="text-white text-sm font-medium">{item.titulo}</span>
                  </div>

                  {/* Descrição (se houver) */}
                  {item.descricao && (
                    <p className="text-gray-400 text-xs ml-6 mb-1">{item.descricao}</p>
                  )}

                  {/* Unidade (se houver) */}
                  {item.unidade && (
                    <p className="text-gray-500 text-xs ml-6 mb-2">- {item.unidade}</p>
                  )}

                  {/* Footer com tempo e ações */}
                  <div className="flex items-center gap-3 ml-6 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-500" />
                      <span className="text-gray-500 text-xs">{item.tempo}</span>
                    </div>

                    {!item.resolvido && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onResolver?.(item.id) }}
                        className="text-green-400 hover:text-green-300 text-xs transition-colors"
                      >
                        Resolver
                      </button>
                    )}
                    {item.resolvido && (
                      <span className="text-gray-500 text-xs">Resolvido</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
