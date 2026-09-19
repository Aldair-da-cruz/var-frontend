'use client'
import { useState } from 'react'

export interface AtividadeRecente {
    descricao: string
    data: string
}

interface AtividadesRecentesProps {
  atividades: AtividadeRecente[];
}

export default function AtividadesRecentes({ atividades }: AtividadesRecentesProps) {
    const [mostrarTodas, setMostrarTodas] = useState(false)
    const visiveis = mostrarTodas ? atividades : atividades.slice(0, 5)

    return(
        <div className="w-full ">
            {/* Título */}
            <h2 className="text-white text-xl font-semibold mb-4">Atividades Recentes</h2>
            
            {/* Cabeçalho da Tabela */}
            <div className="grid grid-cols-2 text-gray-400 text-sm font-medium mb-2 px-1">
                <span>Descrição</span>
                <span>Data</span>
            </div>
            
            {/* Lista de Atividades */}
            <div className="space-y-3">
                {visiveis.map((atividade, index) => (
                    <div key={index} className="grid grid-cols-2 items-start border-b border-gray-700 pb-2">
                        <span className="text-white text-sm font-light flex items-center gap-2">
                            <span>✅</span>
                            {atividade.descricao}
                        </span>
                        <span className="text-gray-400 text-sm font-light">{atividade.data}</span>
                    </div>
                ))}
            </div>

            {/* Link Ver mais/menos */}
            {atividades.length > 5 && (
                <div className="mt-4 text-right">
                    <button onClick={() => setMostrarTodas((v) => !v)} className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                        {mostrarTodas ? 'Ver menos' : 'Ver mais'} &gt;
                    </button>
                </div>
            )}
        </div>
    )
}