import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipPayloadEntry } from 'recharts'

import { ALTURA_POR_TIPO } from '@/components/cards/alturas'
import { linhasExtra } from '@/components/cards/graficos/extras'
import { CaixaTooltip, TickCategoria } from '@/components/cards/graficos/comum'
import { larguraEixoY, PROPS_EIXO, PROPS_GRADE, somenteInteiros } from '@/components/cards/graficos/config'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido'
import { COR_DASH } from '@/lib/cores'
import { formatarEixo, formatarPorUnidade } from '@/lib/formatadores'
import type { DadosBarras, ItemBarra } from '@/types/api'

interface PropsTooltip {
  active?: boolean
  payload?: ReadonlyArray<TooltipPayloadEntry>
}

const CONFIG: ChartConfig = { valor: { label: 'Valor', color: COR_DASH } }

export function BarrasCard({ dados }: { dados: DadosBarras }) {
  const reduzido = useMovimentoReduzido()
  const { itens, unidade } = dados
  const horizontal = dados.horizontal ?? false

  // extra em texto ("66,7%", "R$ 300,00/h") aparece em texto pequeno junto do rótulo
  const extraTexto = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const item of itens) if (typeof item.extra === 'string') mapa.set(item.rotulo, item.extra)
    return mapa
  }, [itens])
  const temExtraTexto = extraTexto.size > 0

  const conteudoTooltip = ({ active, payload }: PropsTooltip) => {
    if (!active || !payload?.length) return null
    const item = payload[0]?.payload as ItemBarra | undefined
    if (!item) return null
    const extra = item.extra
    const rodape =
      typeof extra === 'string' ? (
        <span>{extra}</span>
      ) : extra && typeof extra === 'object' ? (
        linhasExtra(extra).map((l) => <span key={l.chave}>{l.texto}</span>)
      ) : null
    return (
      <CaixaTooltip
        titulo={item.rotulo}
        linhas={[{ chave: 'valor', nome: 'Valor', cor: COR_DASH, valor: formatarPorUnidade(item.valor, unidade) }]}
        rodape={rodape}
      />
    )
  }

  // Altura: horizontais crescem com a quantidade de itens
  const altura = horizontal
    ? Math.max(ALTURA_POR_TIPO.barras - 40, itens.length * (temExtraTexto ? 44 : 36) + 16)
    : ALTURA_POR_TIPO.barras - 20

  return (
    <ChartContainer config={CONFIG} className="aspect-auto w-full" style={{ height: altura }}>
      <BarChart
        data={itens}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 20, right: horizontal ? 56 : 8, bottom: temExtraTexto && !horizontal ? 14 : 0, left: 0 }}
        barCategoryGap="20%"
        accessibilityLayer
      >
        {!horizontal && <CartesianGrid {...PROPS_GRADE} />}
        {horizontal ? (
          <>
            <XAxis type="number" hide domain={[0, 'auto']} />
            <YAxis
              {...PROPS_EIXO}
              type="category"
              dataKey="rotulo"
              width={140}
              interval={0}
              tick={(props) => (
                <TickCategoria {...props} textAnchor="end" max={20} extra={(r) => extraTexto.get(r) ?? null} />
              )}
            />
          </>
        ) : (
          <>
            <XAxis
              {...PROPS_EIXO}
              dataKey="rotulo"
              interval="preserveStartEnd"
              minTickGap={4}
              tick={(props) => <TickCategoria {...props} max={14} extra={(r) => extraTexto.get(r) ?? null} />}
            />
            <YAxis
              {...PROPS_EIXO}
              width={larguraEixoY(unidade)}
              allowDecimals={!somenteInteiros(itens.map((i) => i.valor))}
              tickFormatter={(v: number) => formatarEixo(v, unidade)}
            />
          </>
        )}
        <Tooltip content={conteudoTooltip} cursor={{ fill: 'var(--muted)', opacity: 0.6 }} isAnimationActive={false} />
        <Bar
          dataKey="valor"
          name="Valor"
          fill={COR_DASH}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          maxBarSize={horizontal ? 24 : 56}
          isAnimationActive={!reduzido}
        >
          <LabelList
            dataKey="valor"
            position={horizontal ? 'right' : 'top'}
            offset={6}
            className="fill-foreground"
            fontSize={11}
            formatter={(v: unknown) => (typeof v === 'number' ? formatarEixo(v, unidade) : '')}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
