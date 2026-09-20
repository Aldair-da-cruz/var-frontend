// src/services/index.ts
// Uma função por rota da API.
// Todos os componentes chamam daqui — nunca chamam o axios directamente.

import { api } from '@/lib/api'
import type {
  ApiResponse, PaginatedResponse,
  Empresa, Usuario, Funcionario, Equipamento,
  Alerta, Licenca, Pagamento,
} from '@/types'

// ── Parâmetros comuns de listagem ────────────────────────────

interface ListParams {
  page?:   number
  limit?:  number
  search?: string
  [key: string]: unknown
}

export interface Log {
  id: string
  acao: string
  criadoEm: string
  usuarioId?: string
  empresaId?: string
  usuario?: { id: string; nome: string; email: string; papel: string } | null
}

// =============================================================
// AUTH
// =============================================================

export const authService = {
  login: (email: string, senha: string) =>
    api.post<ApiResponse<{ token: string; usuario: Pick<Usuario, 'id' | 'nome' | 'email' | 'papel' | 'empresaId'> }>>('/auth/login', { email, senha }),
}

// =============================================================
// EMPRESAS
// =============================================================

export const empresaService = {
  listar:    (params?: ListParams)              => api.get<PaginatedResponse<Empresa>>('/empresas', { params }),
  buscar:    (id: string)                       => api.get<ApiResponse<Empresa>>(`/empresas/${id}`),
  criar:     (data: Partial<Empresa>)           => api.post<ApiResponse<Empresa>>('/empresas', data),
  atualizar: (id: string, data: Partial<Empresa>) => api.patch<ApiResponse<Empresa>>(`/empresas/${id}`, data),
  ativar:    (id: string)                       => api.patch<ApiResponse<Empresa>>(`/empresas/${id}/ativar`),
  desativar: (id: string)                       => api.delete(`/empresas/${id}`),
}

// =============================================================
// USUÁRIOS
// =============================================================

export const usuarioService = {
  listar:    (params?: ListParams)                => api.get<PaginatedResponse<Usuario>>('/usuarios', { params }),
  online:    ()                                   => api.get<ApiResponse<{ id: string; nome: string; papel: string; ultimoUso: string }[]>>('/usuarios/online'),
  buscar:    (id: string)                         => api.get<ApiResponse<Usuario>>(`/usuarios/${id}`),
  criar:     (data: Partial<Usuario> & { senha: string }) => api.post<ApiResponse<Usuario>>('/usuarios', data),
  atualizar: (id: string, data: Partial<Usuario>) => api.patch<ApiResponse<Usuario>>(`/usuarios/${id}`, data),
  desativar: (id: string)                         => api.delete(`/usuarios/${id}`),
}

// =============================================================
// FUNCIONÁRIOS
// =============================================================

export const funcionarioService = {
  listar:    (params?: ListParams)                    => api.get<PaginatedResponse<Funcionario>>('/funcionarios', { params }),
  buscar:    (id: string)                             => api.get<ApiResponse<Funcionario>>(`/funcionarios/${id}`),
  criar:     (data: Partial<Funcionario>)             => api.post<ApiResponse<Funcionario>>('/funcionarios', data),
  atualizar: (id: string, data: Partial<Funcionario>) => api.patch<ApiResponse<Funcionario>>(`/funcionarios/${id}`, data),
  desativar: (id: string)                             => api.delete(`/funcionarios/${id}`),
}

// =============================================================
// EQUIPAMENTOS
// =============================================================

export const equipamentoService = {
  listar:    (params?: ListParams)                     => api.get<PaginatedResponse<Equipamento>>('/equipamentos', { params }),
  buscar:    (id: string)                              => api.get<ApiResponse<Equipamento>>(`/equipamentos/${id}`),
  criar:     (data: Partial<Equipamento>)              => api.post<ApiResponse<Equipamento>>('/equipamentos', data),
  atualizar: (id: string, data: Partial<Equipamento>)  => api.patch<ApiResponse<Equipamento>>(`/equipamentos/${id}`, data),
  remover:   (id: string)                              => api.delete(`/equipamentos/${id}`),
}

// =============================================================
// ALERTAS
// =============================================================

export const alertaService = {
  listar:      (params?: ListParams)  => api.get<PaginatedResponse<Alerta>>('/alertas', { params }),
  buscar:      (id: string)           => api.get<ApiResponse<Alerta>>(`/alertas/${id}`),
  criar:       (data: Partial<Alerta>) => api.post<ApiResponse<Alerta>>('/alertas', data),
  marcarLido:  (id: string)           => api.patch<ApiResponse<Alerta>>(`/alertas/${id}/ler`),
  remover:     (id: string)           => api.delete(`/alertas/${id}`),
  resumo:      ()                     => api.get<ApiResponse<{
    total: number; naoLidos: number
    porNivel: { razoavel: number; medio: number; critico: number }
  }>>('/alertas/resumo'),
  naoLidos:    ()                     => api.get<ApiResponse<Alerta[]>>('/alertas/nao-lidos'),
}

// =============================================================
// LICENÇAS
// =============================================================

export const licencaService = {
  listar:    (params?: ListParams)                   => api.get<PaginatedResponse<Licenca>>('/licencas', { params }),
  buscar:    (id: string)                            => api.get<ApiResponse<Licenca>>(`/licencas/${id}`),
  criar:     (data: Partial<Licenca>)                => api.post<ApiResponse<Licenca>>('/licencas', data),
  atualizar: (id: string, data: Partial<Licenca>)    => api.patch<ApiResponse<Licenca>>(`/licencas/${id}`, data),
}

// =============================================================
// PAGAMENTOS
// =============================================================

export const pagamentoService = {
  listar:    (params?: ListParams)                    => api.get<PaginatedResponse<Pagamento>>('/pagamentos', { params }),
  buscar:    (id: string)                             => api.get<ApiResponse<Pagamento>>(`/pagamentos/${id}`),
  criar:     (data: Partial<Pagamento>)               => api.post<ApiResponse<Pagamento>>('/pagamentos', data),
  atualizar: (id: string, data: { status: string })   => api.patch<ApiResponse<Pagamento>>(`/pagamentos/${id}`, data),
}

// =============================================================
// LOGS
// =============================================================

export const logService = {
  listar: (params?: ListParams) =>
    api.get<PaginatedResponse<Log>>('/logs', { params }),
}
// =============================================================
// RELATÓRIOS
// =============================================================

export const relatorioService = {
  alertas:      (params?: ListParams) => api.get('/relatorios/alertas',      { params }),
  financeiro:   (params?: ListParams) => api.get('/relatorios/financeiro',   { params }),
  licencas:     (params?: ListParams) => api.get('/relatorios/licencas',     { params }),
  equipamentos: (params?: ListParams) => api.get('/relatorios/equipamentos', { params }),
}
