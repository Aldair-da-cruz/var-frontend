'use client';

interface Permissao {
    chave: 'permissaoAlertas' | 'permissaoGestao';
    nome: string;
    ativo: boolean;
}

interface PermissoesProps {
  permissoes: Permissao[];
  onToggle: (chave: Permissao['chave'], ativo: boolean) => void;
}

export default function Permissoes({ permissoes, onToggle }: PermissoesProps) {
  return (
    <div className="border-[#050e4c] border rounded-2xl shadow-xl bg-[#040928] p-5 w-full mb-1.5">
      <h2 className="text-white text-xl font-semibold mb-4">Permissões</h2>

      <div className="space-y-3">
        {permissoes.map((permissao) => (
          <div key={permissao.chave} className="flex items-center justify-between">
            <span className="text-white text-sm">{permissao.nome}</span>
            <button
              onClick={() => onToggle(permissao.chave, !permissao.ativo)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                permissao.ativo ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  permissao.ativo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
