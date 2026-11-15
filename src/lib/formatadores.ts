// Formatação de números e datas em pt-BR. Todo número exibido passa por aqui.
// O front não calcula: só formata o que a API envia (já arredondado).

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const VAZIO = '—'

type Valor = number | null | undefined

function invalido(v: Valor): v is null | undefined {
  return v === null || v === undefined || Number.isNaN(v)
}

const fmtMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtCompacto = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })

/** Intl usa espaço não separável (U+00A0 / U+202F); trocamos por espaço normal para textos e testes. */
const ESPACOS_ESPECIAIS = new RegExp(`[${String.fromCharCode(0xa0, 0x202f)}]`, 'g')

function espacos(texto: string) {
  return texto.replace(ESPACOS_ESPECIAIS, ' ')
}

/** Compacto em pt-BR: "1,2 mi", "450 mil", "2,6 bi". */
function compactoBruto(v: number) {
  return espacos(fmtCompacto.format(v))
}

export function numero(v: Valor, casas?: number): string {
  if (invalido(v)) return VAZIO
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas ?? 0,
    maximumFractionDigits: casas ?? 2,
  }).format(v)
}

export function moeda(v: Valor): string {
  if (invalido(v)) return VAZIO
  return espacos(fmtMoeda.format(v))
}

export function moedaCompacta(v: Valor): string {
  if (invalido(v)) return VAZIO
  if (Math.abs(v) < 1000) return `R$ ${numero(v, Math.abs(v) < 10 && v !== Math.trunc(v) ? 2 : 0)}`
  return `R$ ${compactoBruto(v)}`
}

export function compacto(v: Valor): string {
  if (invalido(v)) return VAZIO
  if (Math.abs(v) < 1000) return numero(v)
  return compactoBruto(v)
}

/** A API envia 72.5; o formatador acrescenta "%". */
export function percentual(v: Valor): string {
  if (invalido(v)) return VAZIO
  return `${numero(v, undefined).replace(/(,\d)\d+$/, '$1')}%`
}

export function horas(v: Valor): string {
  if (invalido(v)) return VAZIO
  return `${numero(v)} h`
}

export function dias(v: Valor): string {
  if (invalido(v)) return VAZIO
  return `${numero(v, undefined)} ${v === 1 ? 'dia' : 'dias'}`
}

/* ---------- Unidades ---------- */

const SINGULAR: Record<string, string> = {
  atividades: 'atividade',
  oportunidades: 'oportunidade',
  vendas: 'venda',
  leads: 'lead',
  reuniões: 'reunião',
  tokens: 'token',
}

function comUnidade(texto: string, v: number, unidade: string) {
  const u = v === 1 && SINGULAR[unidade] ? SINGULAR[unidade] : unidade
  return `${texto} ${u}`
}

/** Escolhe o formatador pelo campo "unidade" da API. Unidade desconhecida: número + unidade. */
export function formatarPorUnidade(v: Valor, unidade?: string | null): string {
  if (invalido(v)) return VAZIO
  switch (unidade) {
    case '%':
      return percentual(v)
    case 'R$':
      return moeda(v)
    case 'h':
      return horas(v)
    case 'dias':
      return dias(v)
    case 'tokens':
      return comUnidade(compacto(v), v, 'tokens')
    case undefined:
    case null:
    case '':
      return numero(v)
    default:
      return comUnidade(numero(v), v, unidade)
  }
}

/** Versão curta para eixos e rótulos de gráfico. */
export function formatarEixo(v: Valor, unidade?: string | null): string {
  if (invalido(v)) return VAZIO
  switch (unidade) {
    case '%':
      return `${numero(v, 0)}%`
    case 'R$':
      return moedaCompacta(v)
    case 'h':
      return `${compacto(v)} h`
    default:
      return compacto(v)
  }
}

/** "+3,2%", "-27,5%", "0%" */
export function variacaoPercentual(v: Valor): string {
  if (invalido(v)) return VAZIO
  const sinal = v > 0 ? '+' : ''
  return `${sinal}${percentual(v)}`
}

/* ---------- Datas ---------- */

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/
const RE_MES = /^\d{4}-\d{2}$/

export function ehData(texto: unknown): texto is string {
  return typeof texto === 'string' && RE_DATA.test(texto)
}

export function ehMes(texto: unknown): texto is string {
  return typeof texto === 'string' && RE_MES.test(texto)
}

function paraData(iso: string): Date | null {
  const d = parseISO(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "2026-11-14" → "14/11" */
export function dataCurta(iso: string | null | undefined): string {
  if (!iso) return VAZIO
  const d = paraData(iso)
  return d ? format(d, 'dd/MM', { locale: ptBR }) : VAZIO
}

/** "2026-11-14" → "14/11/2026" */
export function dataLonga(iso: string | null | undefined): string {
  if (!iso) return VAZIO
  const d = paraData(iso)
  return d ? format(d, 'dd/MM/yyyy', { locale: ptBR }) : VAZIO
}

/** "2026-11" → "nov/26" */
export function mesAno(iso: string | null | undefined): string {
  if (!iso) return VAZIO
  const d = paraData(`${iso}-01`)
  return d ? format(d, 'MMM/yy', { locale: ptBR }) : VAZIO
}

/** Data e hora ISO → "12:00:05" */
export function horaCompleta(iso: string | null | undefined): string {
  if (!iso) return VAZIO
  const d = paraData(iso)
  return d ? format(d, 'HH:mm:ss', { locale: ptBR }) : VAZIO
}

/** Intervalo "14/10 – 14/11/2026" (ano só no fim quando é o mesmo). */
export function intervalo(de: string | null | undefined, ate: string | null | undefined): string {
  if (!de || !ate) return VAZIO
  const d1 = paraData(de)
  const d2 = paraData(ate)
  if (!d1 || !d2) return VAZIO
  const mesmoAno = d1.getFullYear() === d2.getFullYear()
  const inicio = format(d1, mesmoAno ? 'dd/MM' : 'dd/MM/yyyy', { locale: ptBR })
  return `${inicio} – ${format(d2, 'dd/MM/yyyy', { locale: ptBR })}`
}

/** Formata um valor de eixo X vindo da API: data, mês ou número. */
export function formatarX(x: unknown): string {
  if (typeof x === 'number') return numero(x)
  if (ehData(x)) return dataCurta(x)
  if (ehMes(x)) return mesAno(x)
  return x === null || x === undefined ? VAZIO : String(x)
}

/** Formata uma célula de texto vinda da API (datas viram dd/MM/yyyy; o resto fica como está). */
export function formatarCelula(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return VAZIO
  if (typeof v === 'number') return numero(v)
  if (ehData(v)) return dataLonga(v)
  return v
}
