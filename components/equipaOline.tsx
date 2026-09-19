import { Users, MapPin, Monitor, User2} from 'lucide-react';

interface Membro {
  nome: string;
  atividade: "Em campo" | "Monitoramento";
}

interface EquipeOnlineProps {
  membros?: Membro[];
}

export default function EquipeOnline({ membros = [] }: EquipeOnlineProps) {

  const getAtividadeIcon = (atividade: string) => {
    switch(atividade) {
      case "Em campo":
        return <MapPin size={14} className="text-green-400" />;
      case "Monitoramento":
        return <Monitor size={14} className="text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full p-3 flex flex-col">
      {/* Cabeçalho com título e link */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-400" />
          <h2 className="text-white text-base font-semibold">Equipe Online</h2>
        </div>
        
        <span className="text-gray-500 text-xs">{membros.length} online</span>
      </div>

      {/* Lista de membros */}
      <div className="flex-1 space-y-2">
        {membros.length === 0 && (
          <p className="text-gray-500 text-xs text-center py-4">Ninguém online neste momento.</p>
        )}
        {membros.map((membro, index) => (
          <div key={index} className="flex items-center justify-between bg-black/30 border border-gray-700 p-2 rounded-lg">
            <div className="flex items-center gap-3">
                <p className='p-2 bg-gray-700 rounded-full'><User2 size={20} color='gray' /></p>
            <span className="text-white text-sm">{membro.nome}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {getAtividadeIcon(membro.atividade)}
              <span className={`text-xs ${
                membro.atividade === "Em campo" ? "text-green-400" : "text-blue-400"
              }`}>
                {membro.atividade}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}