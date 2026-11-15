// Filtros: leitura e escrita na URL, com os mesmos nomes de parâmetros da API.
// O objeto normalizado é usado na chave do React Query, na requisição e no WebSocket.

import type { Escopo, Filtros } from '@/types/api'
import { parametrosDoDashboard } from '@/lib/filtros-config'

const ESCOPOS: readonly Escopo[] = ['projeto', 'time', 'sprint']
const LISTAS = ['tipo_projeto', 'status_projeto', 'origem_lead', 'modelo'] as const
type ChaveLista = (typeof LISTAS)[number]

/** Ordem fixa dos parâmetros na URL (deixa o link estável). */
const ORDEM: (keyof Filtros)[] = [
  'escopo',
  'id',
  'de',
  'ate',
  'tipo_projeto',
  'status_projeto',
  'origem_lead',
  'modelo',
]

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/

function dataValida(texto: string | null): texto is string {
  if (!texto || !RE_DATA.test(texto)) return false
  const [a, m, d] = texto.split('-').map(Number)
  const data = new Date(a, m - 1, d)
  return data.getFullYear() === a && data.getMonth() === m - 1 && data.getDate() === d
}

function normalizarLista(valores: ReadonlyArray<string> | undefined | null): string[] | undefined {
  if (!valores) return undefined
  const limpos = [...new Set(valores.map((v) => v.trim()).filter(Boolean))].sort()
  return limpos.length > 0 ? limpos : undefined
}

/** Normaliza um objeto de filtros: remove vazios e padrões, ordena listas, mantém só o que vale no dashboard. */
export function normalizarFiltros(filtros: Filtros, chave: string): Filtros {
  const validos = parametrosDoDashboard(chave)
  const saida: Filtros = {}

  if (validos.has('escopo') && filtros.escopo && filtros.escopo !== 'projeto' && ESCOPOS.includes(filtros.escopo)) {
    saida.escopo = filtros.escopo
  }
  if (validos.has('id') && typeof filtros.id === 'number' && Number.isInteger(filtros.id) && filtros.id > 0) {
    saida.id = filtros.id
  }
  if (validos.has('de') && filtros.de && dataValida(filtros.de)) saida.de = filtros.de
  if (validos.has('ate') && filtros.ate && dataValida(filtros.ate)) saida.ate = filtros.ate

  for (const chaveLista of LISTAS) {
    if (!validos.has(chaveLista)) continue
    const lista = normalizarLista(filtros[chaveLista])
    if (lista) saida[chaveLista] = lista
  }

  return saida
}

/** Lê os filtros da URL. Valores inválidos são descartados (a API valida o resto). */
export function lerFiltros(params: URLSearchParams, chave: string): Filtros {
  const bruto: Filtros = {}

  const escopo = params.get('escopo')
  if (escopo && (ESCOPOS as readonly string[]).includes(escopo)) bruto.escopo = escopo as Escopo

  const id = params.get('id')
  if (id && /^\d+$/.test(id)) bruto.id = Number(id)

  const de = params.get('de')
  const ate = params.get('ate')
  if (dataValida(de)) bruto.de = de
  if (dataValida(ate)) bruto.ate = ate

  for (const chaveLista of LISTAS) {
    const valor = params.get(chaveLista)
    if (valor) bruto[chaveLista as ChaveLista] = valor.split(',')
  }

  return normalizarFiltros(bruto, chave)
}

/** Escreve os filtros como search params (listas separadas por vírgula). Vazios não entram. */
export function escreverFiltros(filtros: Filtros): URLSearchParams {
  const params = new URLSearchParams()
  for (const chave of ORDEM) {
    const valor = filtros[chave]
    if (valor === undefined || valor === null) continue
    if (Array.isArray(valor)) {
      if (valor.length > 0) params.set(chave, valor.join(','))
    } else if (valor !== '') {
      params.set(chave, String(valor))
    }
  }
  return params
}

/** Query string para as rotas REST. As vírgulas ficam legíveis. */
export function paraQueryString(filtros: Filtros): string {
  return escreverFiltros(filtros).toString().replace(/%2C/gi, ',')
}

/** Objeto "filtros" da mensagem "assinar" do WebSocket: só os definidos, listas como arrays. */
export function paraWebSocket(filtros: Filtros): Filtros {
  const saida: Filtros = {}
  for (const chave of ORDEM) {
    const valor = filtros[chave]
    if (valor !== undefined) Object.assign(saida, { [chave]: Array.isArray(valor) ? [...valor] : valor })
  }
  return saida
}

/** Algum filtro difere do padrão? (controla o botão "Limpar filtros") */
export function temFiltrosAtivos(filtros: Filtros): boolean {
  return Object.keys(filtros).length > 0
}

/** Ao mudar de dashboard, mantém só os filtros que valem no novo. */
export function filtrosParaOutroDashboard(params: URLSearchParams, origem: string, destino: string): string {
  const filtros = lerFiltros(params, origem)
  return paraQueryString(normalizarFiltros(filtros, destino))
}

/** Chave estável para comparar assinaturas (WebSocket) e caches. */
export function chaveDosFiltros(chave: string, filtros: Filtros): string {
  return `${chave}?${paraQueryString(filtros)}`
}
