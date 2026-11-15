import { useMemo } from 'react'
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipPayloadEntry } from 'recharts'

import { ALTURA_POR_TIPO } from '@/components/cards/alturas'
import { CaixaTooltip, Legenda, TituloEixos, type LinhaTooltip } from '@/components/cards/graficos/comum'
import { PROPS_EIXO, PROPS_GRADE, TRACO_REFERENCIA, useIdSvg, larguraEixoY } from '@/components/cards/graficos/config'
import { ProjecaoQuota } from '@/components/cards/tipos/ProjecaoQuota'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido'
import { estiloDaSerie } from '@/lib/cores'
import {
  dataLonga,
  ehData,
  ehMes,
  formatarEixo,
  formatarPorUnidade,
  formatarX,
  mesAno,
  numero,
} from '@/lib/formatadores'
import type { DadosSerieTemporal, ValorPonto } from '@/types/api'

interface PropsTooltip {
  active?: boolean
  payload?: ReadonlyArray<TooltipPayloadEntry>
  label?: unknown
}

/** Linhas e área compartilham a mesma mecânica; muda só como a série principal é desenhada. */
export function SerieTemporalCard({ dados, modo }: { dados: DadosSerieTemporal; modo: 'linhas' | 'area' }) {
  const reduzido = useMovimentoReduzido()
  const idDegrade = useIdSvg('degrade')
  const { series, pontos, unidade, referencia } = dados

  // proj-04: x numérico (horas acumuladas), não data
  const xNumerico = pontos.length > 0 && pontos.every((p) => typeof p.x === 'number')

  const estilos = useMemo(() => series.map((s) => ({ ...s, ...estiloDaSerie(s.chave, series) })), [series])
  // Na área, a primeira série que não é referência vira área; as outras, linhas.
  const chaveArea = modo === 'area' ? estilos.find((s) => !s.referencia)?.chave : undefined

  const config = useMemo<ChartConfig>(
    () => Object.fromEntries(estilos.map((s) => [s.chave, { label: s.nome, color: s.cor }])),
    [estilos],
  )

  const tituloTooltip = (label: unknown, ponto: Record<string, ValorPonto> | undefined) => {
    if (xNumerico) {
      const data = ponto?.data
      const x = `${dados.eixo_x ?? 'x'}: ${numero(typeof label === 'number' ? label : Number(label))}`
      return (
        <div className="grid gap-0.5">
          {typeof data === 'string' && <span>{dataLonga(data)}</span>}
          <span className="font-normal text-muted-foreground">{x}</span>
        </div>
      )
    }
    if (ehData(label)) return dataLonga(label)
    if (ehMes(label)) return mesAno(label)
    return String(label ?? '')
  }

  const conteudoTooltip = ({ active, payload, label }: PropsTooltip) => {
    if (!active || !payload?.length) return null
    const ponto = payload[0]?.payload as Record<string, ValorPonto> | undefined
    const linhas: LinhaTooltip[] = estilos.map((s) => {
      const valor = ponto?.[s.chave]
      return {
        chave: s.chave,
        nome: s.nome,
        cor: s.cor,
        referencia: s.referencia,
        valor: formatarPorUnidade(typeof valor === 'number' ? valor : null, unidade),
      }
    })
    return <CaixaTooltip titulo={tituloTooltip(label, ponto)} linhas={linhas} />
  }

  const projecao = dados.extra && typeof dados.extra === 'object' ? dados.extra.projecao : undefined

  return (
    <div className="flex flex-col gap-3">
      <TituloEixos x={dados.eixo_x} y={dados.eixo_y}>
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height: ALTURA_POR_TIPO[modo] - 40 }}>
          <ComposedChart data={pontos} margin={{ top: 12, right: 12, bottom: 0, left: 0 }} accessibilityLayer>
            <defs>
              <linearGradient id={idDegrade} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--dash)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--dash)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...PROPS_GRADE} />
            <XAxis
              {...PROPS_EIXO}
              dataKey="x"
              type={xNumerico ? 'number' : 'category'}
              domain={xNumerico ? ['dataMin', 'dataMax'] : undefined}
              tickFormatter={(v: unknown) => formatarX(v)}
              minTickGap={24}
            />
            <YAxis
              {...PROPS_EIXO}
              width={larguraEixoY(unidade)}
              tickFormatter={(v: number) => formatarEixo(v, unidade)}
              domain={referencia ? [0, (max: number) => Math.max(max, referencia.valor)] : [0, 'auto']}
            />
            <Tooltip content={conteudoTooltip} cursor={{ stroke: 'var(--border)' }} isAnimationActive={false} />
            {referencia && (
              <ReferenceLine
                y={referencia.valor}
                stroke="var(--ref)"
                strokeDasharray={TRACO_REFERENCIA}
                label={{
                  value: `${referencia.nome}: ${formatarEixo(referencia.valor, unidade)}`,
                  position: 'insideTopRight',
                  fill: 'var(--muted-foreground)',
                  fontSize: 11,
                }}
              />
            )}
            {estilos.map((s) =>
              s.chave === chaveArea ? (
                <Area
                  key={s.chave}
                  dataKey={s.chave}
                  name={s.nome}
                  type="monotone"
                  stroke={s.cor}
                  strokeWidth={2}
                  fill={`url(#${idDegrade})`}
                  connectNulls={false}
                  dot={false}
                  activeDot={{ r: 3 }}
                  isAnimationActive={!reduzido}
                />
              ) : (
                <Line
                  key={s.chave}
                  dataKey={s.chave}
                  name={s.nome}
                  type={modo === 'area' ? 'monotone' : 'linear'}
                  stroke={s.cor}
                  strokeWidth={2}
                  strokeDasharray={s.referencia ? TRACO_REFERENCIA : undefined}
                  connectNulls={false}
                  dot={pontos.length === 1 ? { r: 3 } : false}
                  activeDot={{ r: 3 }}
                  isAnimationActive={!reduzido}
                />
              ),
            )}
          </ComposedChart>
        </ChartContainer>
      </TituloEixos>

      {estilos.length >= 2 && (
        <Legenda
          itens={estilos.map((s) => ({
            chave: s.chave,
            nome: s.nome,
            cor: s.cor,
            referencia: s.referencia,
            forma: s.chave === chaveArea ? 'barra' : 'linha',
          }))}
        />
      )}

      {projecao !== undefined && <ProjecaoQuota projecao={projecao} unidade={unidade} />}
    </div>
  )
}

export function LinhasCard({ dados }: { dados: DadosSerieTemporal }) {
  return <SerieTemporalCard dados={dados} modo="linhas" />
}

export function AreaCard({ dados }: { dados: DadosSerieTemporal }) {
  return <SerieTemporalCard dados={dados} modo="area" />
}
