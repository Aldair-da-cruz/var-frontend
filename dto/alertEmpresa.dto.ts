export interface EmpresaAlertaAPI {
    id: string
    nome: string
    cnpj: string
    _count?: {
      equipamentos?: number
      alertas?: number
    }
  }
  
  export interface EmpresaListaAlerta {
    id: string
    nome: string
    nif: string
    _count: {
      equipamentos: number
      alertas: number
    }
  }

  export function mapEmpresaAlerta(
    empresa: EmpresaAlertaAPI
  ): EmpresaListaAlerta {
    return {
      id: empresa.id,
      nome: empresa.nome,
      nif: empresa.cnpj,
      _count: {
        equipamentos: empresa._count?.equipamentos ?? 0,
        alertas: empresa._count?.alertas ?? 0,
      },
    }
  }