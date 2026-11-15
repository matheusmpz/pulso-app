// Tipos do contrato da API do Pulso.
// Conferidos contra a API real (localhost:8080) em 15/11/2026.

/* ---------- Envelope ---------- */

export type Envelope<T> = { sucesso: true; dados: T } | { sucesso: false; erro: string }

/* ---------- Autenticação ---------- */

export interface UsuarioLogin {
  id: string
  nome: string
  email: string
  perfil: string
}

export interface RespostaLogin {
  token: string
  expira_em: string
  usuario: UsuarioLogin
}

export interface Perfil {
  id: number
  nome: string
  descricao: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
}

/* ---------- Dashboards ---------- */

export interface DashboardResumo {
  id: number
  chave: string
  titulo: string
  descricao: string
  total_cards: number
  /** Opcional: cor do dashboard (emerald, violet, orange). Se ausente, usa o mapa padrão. */
  cor?: string | null
}

export interface RespostaDashboards {
  dashboards: DashboardResumo[]
}

export type TipoCard = 'numero' | 'linhas' | 'area' | 'barras' | 'barras_agrupadas' | 'donut' | 'radial' | 'lista'

export interface CardMeta {
  codigo: string
  titulo: string
  descricao: string
  tipo: TipoCard
}

export interface DashboardDetalhe {
  id: number
  chave: string
  titulo: string
  descricao: string
  cor?: string | null
  cards: CardMeta[]
}

/* ---------- Filtros ---------- */

export type Escopo = 'projeto' | 'time' | 'sprint'

/** Filtros normalizados, com os mesmos nomes de parâmetros da API. Ausente = padrão da API. */
export interface Filtros {
  escopo?: Escopo
  id?: number
  de?: string
  ate?: string
  tipo_projeto?: string[]
  status_projeto?: string[]
  origem_lead?: string[]
  modelo?: string[]
}

export interface FiltrosAplicados {
  escopo?: Escopo
  id: number | null
  de: string
  ate: string
  tipo_projeto: string[] | null
  status_projeto: string[] | null
  origem_lead: string[] | null
  modelo: string[] | null
}

export interface OpcaoRotulada {
  valor: string
  rotulo: string
}

export interface OpcaoProjeto {
  id: number
  nome: string
  tipo: string
  status: string
}

export interface OpcaoTime {
  id: number
  nome: string
}

export interface OpcaoSprint {
  id: number
  time_id: number
  time_nome: string
  numero: number
  inicio: string
  fim: string
  atual: boolean
}

export interface OpcoesFiltros {
  tipos_projeto: OpcaoRotulada[]
  status_projeto: OpcaoRotulada[]
  origens: string[]
  modelos: string[]
  projetos: OpcaoProjeto[]
  times: OpcaoTime[]
  sprints: OpcaoSprint[]
}

/* ---------- Cards ---------- */

export type Unidade = string

export interface Detalhe {
  rotulo: string
  valor: number | null
  unidade: Unidade
}

export interface DadosNumero {
  valor: number | null
  unidade: Unidade
  variacao: { valor: number | null; unidade: string } | null
  detalhe: Detalhe[] | null
}

export interface Serie {
  chave: string
  nome: string
  pilha?: string | null
}

export type ValorPonto = number | string | null

export interface DadosSerieTemporal {
  series: Serie[]
  pontos: Array<Record<string, ValorPonto>>
  eixo_x?: string
  eixo_y?: string
  unidade?: Unidade
  referencia?: { nome: string; valor: number } | null
  extra?: Record<string, unknown> | null
}

export interface ItemBarra {
  rotulo: string
  valor: number | null
  /** Texto pronto ("66,7%"), objeto ({ desvio, projeto } / { n }) ou null */
  extra?: string | Record<string, unknown> | null
}

export interface DadosBarras {
  itens: ItemBarra[]
  unidade?: Unidade
  horizontal?: boolean
  total?: number | null
}

export type ItemAgrupado = Record<string, string | number | boolean | null> & { rotulo: string }

export interface DadosBarrasAgrupadas {
  series: Serie[]
  itens: ItemAgrupado[]
  unidade?: Unidade
  /** Linha de referência numérica (ia-10: 100 = no prazo) */
  referencia?: number | null
  /** Amostra mínima para confiar no valor (ia-10) */
  amostra_minima?: number | null
}

export interface Fatia {
  rotulo: string
  chave?: string
  valor: number
  tokens?: number
}

export interface DadosDonut {
  fatias: Fatia[]
  total: number
  /** A API ainda não envia; quando enviar, tem prioridade sobre o mapa local. */
  unidade?: Unidade
}

export interface DadosRadial {
  valor: number | null
  meta: number
  unidade: Unidade
  detalhe?: Detalhe[] | null
}

export interface DadosLista {
  colunas: string[]
  linhas: Array<Array<string | number | null>>
  total: number
}

export interface DadosPorTipo {
  numero: DadosNumero
  linhas: DadosSerieTemporal
  area: DadosSerieTemporal
  barras: DadosBarras
  barras_agrupadas: DadosBarrasAgrupadas
  donut: DadosDonut
  radial: DadosRadial
  lista: DadosLista
}

/** Gancho para o futuro: hoje a API sempre envia null. */
export interface AlertaCard {
  nivel: 'atencao' | 'critico'
  mensagem?: string
}

export interface CardResultado<D = unknown> {
  codigo: string
  titulo: string
  tipo: TipoCard
  dados?: D
  alerta: AlertaCard | null
  atualizado_em?: string
  erro?: string
}

export interface RespostaDadosDashboard {
  dashboard: { id: number; chave: string; titulo: string }
  filtros_aplicados: FiltrosAplicados
  cards: CardResultado[]
}

export interface RespostaDadosCard {
  filtros_aplicados: FiltrosAplicados
  card: CardResultado
}

/* ---------- WebSocket ---------- */

export type MensagemServidor =
  | { tipo: 'assinado'; dashboard: string; cards: string[] }
  | { tipo: 'card_atualizado'; card: string; dados: CardResultado }
  | { tipo: 'erro'; mensagem: string }

export interface MensagemAssinar {
  tipo: 'assinar'
  dashboard: string
  filtros: Filtros
}
