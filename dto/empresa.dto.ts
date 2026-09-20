import type { Empresa } from "@/components/tabela8"

export type EmpresaStatus = "Ativo" | "Inativo"

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
      status: item.status,
      alertas: item._count?.alertas ?? 0
    }
  }