// src/types/index.ts
// Tipos que espelham as entidades da API.
// Mantenha sincronizado com o schema.prisma do backend.

// ── Enums ────────────────────────────────────────────────────

export type Papel         = 'ADM' | 'Operacional' | 'Cliente'
export type NivelAlerta   = 'razoavel' | 'medio' | 'critico'
export type StatusEq      = 'Operacional' | 'Manutencao'
export type PlanoLicenca  = 'Basico' | 'Profissional' | 'Premium'
export type StatusLicenca = 'Ativa' | 'Expirada' | 'Suspensa'
export type StatusPag     = 'Pendente' | 'Concluido' | 'Reembolsado'

// ── Resposta padrão da API ───────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data:    T
}

export interface PaginatedResponse<T> {
  success: boolean
  data:    T[]
  meta: {
    total:      number
    page:       number
    limit:      number
    totalPages: number
  }
}

// ── Entidades ────────────────────────────────────────────────

export interface Usuario {
  id:        string
  nome:      string
  email:     string
  papel:     Papel
  status:    'Ativo' | 'Inativo'
  empresaId: string | null
  empresa?:  { id: string; nome: string }
  criadoEm:  string
}

export interface Empresa {
  id:       string
  nome:     string
  cnpj:     string
  email:    string
  telefone: string | null
  status:   'Ativo' | 'Inativo'
  criadoEm: string
  _count?: { funcionarios: number; equipamentos: number }
}

export interface Funcionario {
  id:        string
  nome:      string
  email:     string
  cargo:     string
  telefone:  string | null
  status:    'Ativo' | 'Inativo' | 'Pendente'
  empresaId: string
  criadoEm:  string
  empresa?:  { id: string; nome: string }
}

export interface Equipamento {
  id:          string
  nome:        string
  modelo:      string
  fabricante:  string | null
  numeroSerie: string | null
  localizacao: string
  status:      StatusEq
  empresaId:   string
  criadoEm:    string
  _count?: { alertas: number }
}

export interface Alerta {
  id:            string
  descricao:     string
  nivel:         NivelAlerta
  lidoEm:        string | null
  criadoEm:      string
  empresaId:     string
  equipamentoId: string
  lidoPorId:     string | null
  equipamento?:  { id: string; nome: string; localizacao: string }
  empresa?:      { id: string; nome: string }
  lidoPor?:      { id: string; nome: string } | null
}

export interface Licenca {
  id:                string
  plano:             PlanoLicenca
  status:            StatusLicenca
  statusCalculado:   StatusLicenca
  diasRestantes:     number
  maxDeFuncionarios: number
  inicioEm:          string
  expiraEm:          string
  empresaId:         string
}

export interface Pagamento {
  id:        string
  valor:     number
  moeda:     string
  status:    StatusPag
  referencia: string | null
  criadoEm:  string
  empresaId: string
  licencaId: string
  empresa?:  { id: string; nome: string }
  licenca?:  { id: string; plano: string }
}

// ── Auth ─────────────────────────────────────────────────────

export interface LoginResponse {
  token:   string
  usuario: Pick<Usuario, 'id' | 'nome' | 'email' | 'papel' | 'empresaId'>
}
