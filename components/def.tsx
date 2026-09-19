import { Bell, Mail, ChevronDown } from 'lucide-react';

interface PreferenciasNotificacaoProps {
  emailAtivo: boolean;
  onToggleEmail: (ativo: boolean) => void;
  idioma: string;
  onIdiomaChange: (idioma: string) => void;
}

export default function PreferenciasNotificacao({ emailAtivo, onToggleEmail, idioma, onIdiomaChange }: PreferenciasNotificacaoProps) {
  return (
    <div className=" rounded-2xl p-5 w-full flex  justify-between gap-3">
      {/* Preferência de Notificação */}
     <div className="p-4 bg-[#040928] rounded-lg border border-[#050e4c] w-[600px] h-[200px]">
         <h2 className="text-white text-xl font-semibold mb-4">Preferência de Notificação</h2>

      {/* Opções de Notificação */}
      <div className="space-y-3 mb-6">
        {/* Receber notificações por e-mail */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={emailAtivo}
            onChange={(e) => onToggleEmail(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          <Mail size={18} className="text-gray-400 group-hover:text-white transition-colors" />
          <span className="text-white text-sm">Receber notificações por e-mail</span>
        </label>

        <p className="text-gray-500 text-xs flex items-center gap-2 ml-7">
          <Bell size={12} />
          Alertas de equipamentos e empresas aparecem sempre em &quot;Gestão de alertas&quot;.
        </p>
      </div>
     </div>

      <div className="p-4 bg-[#040928] rounded-lg border border-[#050e4c] w-[600px] h-[200px]">
        {/* Idioma */}
      <h2 className="text-white text-xl font-semibold mb-4">Idioma</h2>

      {/* Idioma Selecionado */}
      <div className="mb-3">
        <p className="text-gray-400 text-sm mb-2">Selecionado: <span className="text-white">{idioma}</span></p>

        {/* Select de Idioma */}
        <div className="relative">
          <select
            value={idioma}
            onChange={(e) => onIdiomaChange(e.target.value)}
            className="w-full bg-[#040928] text-white border border-[#050e4c] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="Português (PT)">Português</option>
            <option value="English">Inglês</option>
            <option value="Español">Espanhol</option>
            <option value="Français">Francês</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
      </div>
    </div>
  );
}
