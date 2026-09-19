'use client'
import { useState } from 'react';
import { X, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface ModalRenovarLicencaProps {
  isOpen:     boolean;
  onClose:    () => void;
  onRenovado: () => void;
  empresaId:  string;
  plano:      string;
  precoBase:  number;
}

const metodosPagamento = [
  "Multicaixa Express",
  "Transferência IBAN",
  "Depósito",
];

export default function ModalRenovarLicenca({
  isOpen,
  onClose,
  onRenovado,
  empresaId,
  plano,
  precoBase,
}: ModalRenovarLicencaProps) {
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState(metodosPagamento[0]);
  const [duracao, setDuracao] = useState(12);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  if (!isOpen) return null;

  const valor = Math.round(precoBase * duracao / 12);

  const confirmar = async () => {
    try {
      setLoading(true);
      setErro('');

      const inicioEm = new Date();
      const expiraEm = new Date();
      expiraEm.setMonth(expiraEm.getMonth() + duracao);

      const resLic = await api.post('/licencas', {
        empresaId,
        plano,
        maxDeFuncionarios: duracao <= 6 ? 2 : duracao <= 12 ? 6 : 12,
        inicioEm:  inicioEm.toISOString(),
        expiraEm:  expiraEm.toISOString(),
      });
      const licencaId = resLic.data.data.id;

      await api.post('/pagamentos', {
        empresaId,
        licencaId,
        valor,
        moeda:      'AOA',
        referencia: metodoPagamento,
      });

      setSucesso(true);
      setTimeout(() => { setSucesso(false); onClose(); onRenovado(); }, 1800);
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Erro ao renovar licença.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0a1240] border border-[#1a2a80] rounded-2xl p-7 w-[480px] max-w-[95vw] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {sucesso ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
              <Check size={32} className="text-green-500" />
            </div>
            <p className="text-white text-lg font-semibold">Renovação submetida!</p>
            <p className="text-gray-400 text-sm">O pagamento ficará pendente até confirmação.</p>
          </div>
        ) : (
        <>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-base font-semibold">Renovar Licença</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-red-600/20 border border-red-600 text-red-400 text-sm">{erro}</div>
        )}

        {/* Linha 1: Licença + Duração */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <p className="text-[#8899cc] text-xs mb-1.5">Licença</p>
            <div className="bg-[#040928] border border-[#1a2a80] rounded-lg px-3 py-2.5 text-white text-sm">
              {plano}
            </div>
          </div>
          <div>
            <p className="text-[#8899cc] text-xs mb-1.5">Duração (meses)</p>
            <div className="flex items-center gap-2 bg-[#040928] border border-[#1a2a80] rounded-lg px-2 py-1.5">
              <button onClick={() => setDuracao((d) => Math.max(1, d - 1))}
                className="w-7 h-7 bg-[#1a2a80] hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                <ChevronDown size={14} />
              </button>
              <span className="flex-1 text-center text-white text-sm">{duracao}</span>
              <button onClick={() => setDuracao((d) => d + 1)}
                className="w-7 h-7 bg-[#1a2a80] hover:bg-blue-600 text-white rounded-md flex items-center justify-center transition-colors">
                <ChevronUp size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[#8899cc] text-xs mb-1.5">Valor</p>
          <div className="bg-[#040928] border border-[#1a2a80] rounded-lg px-3 py-2.5 text-white text-sm">
            AOA {valor.toLocaleString('pt-PT')},00
          </div>
        </div>

        {/* Método de Pagamento */}
        <div className="mb-8 relative">
          <p className="text-[#8899cc] text-xs mb-1.5">Método de Pagamento</p>
          <button
            onClick={() => setDropdownAberto(!dropdownAberto)}
            className="w-full bg-[#040928] border border-[#1a2a80] rounded-lg px-3 py-2.5 text-white text-sm flex items-center justify-between"
          >
            {metodoPagamento}
            {dropdownAberto
              ? <ChevronUp size={16} className="text-gray-400" />
              : <ChevronDown size={16} className="text-gray-400" />
            }
          </button>

          {dropdownAberto && (
            <div className="absolute top-full left-0 w-full bg-[#040928] border border-[#1a2a80] rounded-lg overflow-hidden z-10 mt-0.5">
              {metodosPagamento
                .filter((m) => m !== metodoPagamento)
                .map((metodo) => (
                  <button
                    key={metodo}
                    onClick={() => {
                      setMetodoPagamento(metodo);
                      setDropdownAberto(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    {metodo}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Botão Confirmar */}
        <button
          onClick={confirmar}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'A processar...' : 'Confirmar & Pagar'}
        </button>
        </>
        )}
      </div>
    </div>
  );
}
