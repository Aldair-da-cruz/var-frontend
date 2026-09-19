import type { Empresa } from "@/components/tabela8"

export type EmpresaStatus = "Ativo" | "Inativo" | "Em pausa"

function normalizeStatus(status: string): EmpresaStatus {
    if (status === "Ativo") return "Ativo"
    if (status === "Inativo") return "Inativo"
    return "Em pausa"
  }

export interface EmpresaAPI {
  id: string
  nome: string
  cnpj: string
  email: string
  telefone: string | null
  status: EmpresaStatus
  _count?: {
    funcionarios: number
    equipamentos: number
    alertas?: number
  }
}

export function mapEmpresaToTabela(item: EmpresaAPI): Empresa {
    return {
      empresa: item.nome,
      designacao: item.email,
      local: item.cnpj,
      funcionarios: item._count?.funcionarios ?? 0,
      status: normalizeStatus(item.status),
      alertas: item._count?.alertas ?? 0
    }
  }