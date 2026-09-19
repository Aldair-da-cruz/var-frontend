import { Mail, Phone, MapPin, User, Briefcase, Building2, Percent, CheckCircle } from 'lucide-react';

interface PerfilFuncionarioProps {
  nome?: string;
  cargo?: string;
  empresa?: string;
  perfilCompleto?: number;
  email?: string;
  telefone?: string;
  localizacao?: string;
  status?: "Ativo" | "Inativo" | "Em pausa";
  avatarUrl?: string | null;
  onAlterarFoto?: () => void;
}

export default function PerfilFuncionario({
  nome = "",
  cargo = "",
  empresa = "",
  perfilCompleto = 100,
  email = "",
  telefone = "—",
  localizacao = "—",
  status = "Ativo",
  avatarUrl = null,
  onAlterarFoto,
}: PerfilFuncionarioProps) {

  const getStatusColor = () => {
    switch(status) {
      case "Ativo": return "text-green-400 bg-green-500/10";
      case "Inativo": return "text-gray-400 bg-gray-500/10";
      case "Em pausa": return "text-yellow-400 bg-yellow-500/10";
      default: return "text-green-400 bg-green-500/10";
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case "Ativo": return <CheckCircle size={12} className="text-green-400" />;
      case "Inativo": return <User size={12} className="text-gray-400" />;
      case "Em pausa": return <User size={12} className="text-yellow-400" />;
      default: return <CheckCircle size={12} className="text-green-400" />;
    }
  };

  return (
    <div className="w-full h-full bg-[#040928] border border-[#050e4c] rounded-2xl p-5">
      {/* Cabeçalho com nome e cargo */}
      <div className="flex items-start justify-between mb-3">
        <div className='flex items-center justify-center gap-2'>
        <button
          type="button"
          onClick={onAlterarFoto}
          title="Alterar foto de perfil"
          className='relative bg-gray-700 flex items-center justify-center rounded-full w-[100px] h-[100px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity'
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={nome} className="w-full h-full object-cover" />
          ) : (
            <User size={70} className="text-gray-500" />
          )}
        </button>
         <div>
             <h2 className="text-white text-xl font-semibold">{nome}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{cargo}</p>
          <div className="flex items-center gap-1 mt-1">
            <Building2 size={12} className="text-gray-500" />
            <span className="text-gray-300 text-xs">{empresa}</span>
         </div>
          </div>
        </div>
        
        {/* Status */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-xs font-medium">{status}</span>
        </div>
      </div>

      {/* Progresso do perfil */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-1">
            <Percent size={10} className="text-gray-500" />
            <span className="text-gray-400">Perfil completo</span>
          </div>
          <span className="text-blue-400 font-medium">{perfilCompleto}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
            style={{ width: `${perfilCompleto}%` }}
          ></div>
        </div>
      </div>

      {/* Informações de Contactos */}
      <div>
        <h3 className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1">
          <span>Informações de Contactos</span>
          <span className="h-px flex-1 bg-gray-700 ml-2"></span>
        </h3>
        
        <div className="space-y-2">
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-gray-500" />
            <span className="text-gray-300 text-sm">{email}</span>
          </div>

          {/* Telefone */}
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-gray-500" />
            <span className="text-gray-300 text-sm">{telefone}</span>
          </div>

          {/* Localização */}
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-500" />
            <span className="text-gray-300 text-sm">{localizacao}</span>
          </div>
        </div>
      </div>
    </div>
  );
}