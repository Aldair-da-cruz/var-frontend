'use client'
import { Download, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface HistoricoPagamentosProps {
  onFiltrarPeriodo?: (periodo: string) => void;
  onFiltrarStatus?: (status: string) => void;
  onFiltrarMetodo?: (metodo: string) => void;
  onExportar?: () => void;
}

interface FiltroSelectProps {
  label: string;
  options: { value: string; label: string }[];
  onChange?: (valor: string) => void;
}

function FiltroSelect({ label, options, onChange }: FiltroSelectProps) {
  const [aberto, setAberto] = useState(false);
  const [selecionado, setSelecionado] = useState('');

  const handleSelect = (valor: string, labelOpc: string) => {
    setSelecionado(labelOpc);
    onChange?.(valor);
    setAberto(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center justify-between gap-4 w-[190px] bg-[#040928] border border-[#050e4c] rounded-lg px-3 py-2 text-sm text-white focus:outline-none hover:border-blue-500 transition-colors cursor-pointer"
      >
        <span className="text-left text-gray-300 truncate">{selecionado || label}</span>
        <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      {aberto && (
        <div className="absolute top-full left-0 w-full bg-[#040928] border border-[#1a2a80] rounded-lg overflow-hidden z-20 mt-0.5 shadow-xl">
          <button
            onClick={() => handleSelect('', label)}
            className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-white/10 transition-colors"
          >
            {label}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value, opt.label)}
              className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoricoPagamentos({
  onFiltrarPeriodo,
  onFiltrarStatus,
  onFiltrarMetodo,
  onExportar
}: HistoricoPagamentosProps) {
  return (
    <div className="w-full">
      <h2 className="text-white text-lg font-light mb-4">Histórico de Pagamentos</h2>
      
      {/* Filtros: Método de Pagamento | Data | Status */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <FiltroSelect
            label="Método de pagamento"
            options={[
              { value: 'Multicaixa Express', label: 'Multicaixa Express' },
              { value: 'Transferência IBAN', label: 'Transferência IBAN' },
              { value: 'Depósito', label: 'Depósito' },
            ]}
            onChange={onFiltrarMetodo}
          />

          <FiltroSelect
            label="Data"
            options={[
              { value: 'hoje', label: 'Hoje' },
              { value: 'ontem', label: 'Ontem' },
              { value: 'esta-semana', label: 'Esta semana' },
              { value: 'este-mes', label: 'Este mês' },
              { value: 'este-ano', label: 'Este ano' },
            ]}
            onChange={onFiltrarPeriodo}
          />

          <FiltroSelect
            label="Status"
            options={[
              { value: 'Concluido', label: 'Pago' },
              { value: 'Pendente', label: 'Pendente' },
              { value: 'Reembolsado', label: 'Reembolsado' },
            ]}
            onChange={onFiltrarStatus}
          />
        </div>

        {/* Botão Exportar */}
        <button
          onClick={onExportar}
          className="w-[200px] bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white font-medium px-3 py-2 rounded-lg transition-colors text-xs border border-gray-700 flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Exportar PDF&apos;s
        </button>
      </div>
    </div>
  );
}