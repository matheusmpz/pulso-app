// Cliente HTTP: fina camada sobre fetch.
// Prefixa a URL da API, envia o Bearer, desembrulha o envelope e lança ApiError tipado.

import type {
  DashboardDetalhe,
  Envelope,
  Filtros,
  OpcoesFiltros,
  RespostaDadosCard,
  RespostaDadosDashboard,
  RespostaDashboards,
  RespostaLogin,
  Usuario,
} from '@/types/api'
import { API_URL } from '@/lib/config'
import { paraQueryString } from '@/lib/filtros'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
  }
}

export function ehApiError(erro: unknown): erro is ApiError {
  return erro instanceof ApiError
}

/* ---------- Integração com a autenticação ---------- */

let obterToken: () => string | null = () => null
let aoNaoAutorizado: () => void = () => {}

/** Chamado pelo AuthProvider para ligar o cliente à sessão atual. */
export function configurarAutenticacao(opcoes: { obterToken: () => string | null; aoNaoAutorizado: () => void }) {
  obterToken = opcoes.obterToken
  aoNaoAutorizado = opcoes.aoNaoAutorizado
}

/* ---------- Requisição ---------- */

const MENSAGEM_REDE = 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
const MENSAGEM_GENERICA = 'Erro interno. Tente novamente mais tarde.'

interface OpcoesRequisicao {
  metodo?: 'GET' | 'POST'
  corpo?: unknown
  /** Rotas públicas (login): não envia token e não dispara o logout em 401. */
  publica?: boolean
  /** Não dispara o logout global em 401 (usado pelo próprio logout). */
  ignorar401?: boolean
  signal?: AbortSignal
}

async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const { metodo = 'GET', corpo, publica = false, ignorar401 = false, signal } = opcoes
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'

  const token = publica ? null : obterToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let resposta: Response
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal,
    })
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') throw erro
    throw new ApiError(0, MENSAGEM_REDE)
  }

  let envelope: Envelope<T> | null
  try {
    envelope = (await resposta.json()) as Envelope<T>
  } catch {
    envelope = null
  }

  if (resposta.ok && envelope?.sucesso) return envelope.dados

  const mensagem = envelope && !envelope.sucesso && envelope.erro ? envelope.erro : MENSAGEM_GENERICA
  const status = resposta.ok ? 500 : resposta.status

  if (status === 401 && !publica && !ignorar401) aoNaoAutorizado()

  throw new ApiError(status, mensagem)
}

/* ---------- Rotas ---------- */

export const api = {
  login: (email: string, senha: string) =>
    requisitar<RespostaLogin>('/auth/login', { metodo: 'POST', corpo: { email, senha }, publica: true }),

  /** Revoga o token no servidor. Chamado em melhor esforço: quem chama ignora falhas. */
  logout: (token: string) =>
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      keepalive: true,
    }).then(() => undefined),

  me: (signal?: AbortSignal) => requisitar<Usuario>('/auth/me', { signal }),

  dashboards: (signal?: AbortSignal) => requisitar<RespostaDashboards>('/dashboards', { signal }),

  dashboard: (chave: string, signal?: AbortSignal) =>
    requisitar<DashboardDetalhe>(`/dashboards/${encodeURIComponent(chave)}`, { signal }),

  dadosDashboard: (chave: string, filtros: Filtros, signal?: AbortSignal) =>
    requisitar<RespostaDadosDashboard>(
      `/dashboards/${encodeURIComponent(chave)}/dados${comQuery(paraQueryString(filtros))}`,
      { signal },
    ),

  dadosCard: (codigo: string, filtros: Filtros, signal?: AbortSignal) =>
    requisitar<RespostaDadosCard>(`/cards/${encodeURIComponent(codigo)}/dados${comQuery(paraQueryString(filtros))}`, {
      signal,
    }),

  opcoesFiltros: (signal?: AbortSignal) => requisitar<OpcoesFiltros>('/filtros/opcoes', { signal }),
}

function comQuery(qs: string) {
  return qs ? `?${qs}` : ''
}
