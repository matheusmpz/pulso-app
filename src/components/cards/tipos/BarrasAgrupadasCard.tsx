import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import type { TooltipPayloadEntry } from 'recharts'

import { ALTURA_POR_TIPO } from '@/components/cards/alturas'
import { linhasExtra } from '@/components/cards/graficos/extras'
import { CaixaTooltip, DefHachura, Legenda, TickCategoria, type LinhaTooltip } from '@/components/cards/graficos/comum'
import {
  PROPS_EIXO,
  PROPS_GRADE,
  TRACO_REFERENCIA,
  useIdSvg,
  larguraEixoY,
  somenteInteiros,
} from '@/components/cards/graficos/config'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido'
import { estiloDaSerie } from '@/lib/cores'
import { formatarEixo, formatarPorUnidade, numero } from '@/lib/formatadores'
import type { DadosBarrasAgrupadas, ItemAgrupado } from '@/types/api'

interface PropsTooltip {
  active?: boolean
  payload?: ReadonlyArray<TooltipPayloadEntry>
}

const CHAVES_FIXAS = new Set(['rotulo', 'destaque'])

export function BarrasAgrupadasCard({ dados }: { dados: DadosBarrasAgrupadas }) {
  const reduzido = useMovimentoReduzido()
  const idHachura = useIdSvg('hachura')
  const { series, itens, unidade } = dados
  const referencia = typeof dados.referencia === 'number' ? dados.referencia : null
  const amostraMinima = typeof dados.amostra_minima === 'number' ? dados.amostra_minima : null

  const estilos = useMemo(() => series.map((s) => ({ ...s, ...estiloDaSerie(s.chave, series) })), [series])
  const chavesSeries = useMemo(() => new Set(series.map((s) => s.chave)), [series])

  // Em cada pilha, só o último segmento tem os cantos arredondados (ponta do dado).
  const ultimaDaPilha = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const s of series) if (s.pilha) mapa.set(s.pilha, s.chave)
    return mapa
  }, [series])

  const temDestaque = itens.some((i) => i.destaque === true)
  const temNegativo = itens.some((i) =>
    series.some((s) => typeof i[s.chave] === 'number' && (i[s.chave] as number) < 0),
  )

  const quantidade = (item: ItemAgrupado, chave: string): number | null => {
    const n = item[`n_${chave}`]
    return typeof n === 'number' ? n : null
  }
  const amostraPequena = (item: ItemAgrupado, chave: string) => {
    const n = quantidade(item, chave)
    return amostraMinima !== null && n !== null && n < amostraMinima
  }

  const opacidade = (item: ItemAgrupado, chave: string) => {
    if (amostraPequena(item, chave)) return 0.4
    if (temDestaque) return item.destaque === true ? 1 : 0.7
    return 1
  }

  const config = useMemo<ChartConfig>(
    () => Object.fromEntries(estilos.map((s) => [s.chave, { label: s.nome, color: s.cor }])),
    [estilos],
  )

  const conteudoTooltip = ({ active, payload }: PropsTooltip) => {
    if (!active || !payload?.length) return null
    const item = payload[0]?.payload as ItemAgrupado | undefined
    if (!item) return null
    const linhas: LinhaTooltip[] = estilos.map((s) => {
      const v = item[s.chave]
      const n = quantidade(item, s.chave)
      return {
        chave: s.chave,
        nome: s.nome,
        cor: s.cor,
        referencia: s.referencia,
        valor: formatarPorUnidade(typeof v === 'number' ? v : null, unidade),
        nota:
          n === null
            ? undefined
            : amostraPequena(item, s.chave)
              ? `amostra pequena (n = ${numero(n)})`
              : `n = ${numero(n)}`,
      }
    })
    const ignorar = new Set([...CHAVES_FIXAS, ...chavesSeries, ...[...chavesSeries].map((c) => `n_${c}`)])
    const extras = linhasExtra(item, ignorar)
    return (
      <CaixaTooltip
        titulo={item.rotulo}
        linhas={linhas}
        rodape={extras.length > 0 ? extras.map((e) => <span key={e.chave}>{e.texto}</span>) : undefined}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height: ALTURA_POR_TIPO.barras_agrupadas - 40 }}
      >
        <BarChart
          data={itens}
          margin={{ top: 16, right: 8, bottom: 0, left: 0 }}
          barGap={2}
          barCategoryGap="20%"
          stackOffset={temNegativo ? 'sign' : undefined}
          accessibilityLayer
        >
          <DefHachura id={idHachura} />
          <CartesianGrid {...PROPS_GRADE} />
          <XAxis
            {...PROPS_EIXO}
            dataKey="rotulo"
            interval="preserveStartEnd"
            minTickGap={4}
            tick={(props) => <TickCategoria {...props} max={16} />}
          />
          <YAxis
            {...PROPS_EIXO}
            width={larguraEixoY(unidade)}
            allowDecimals={!somenteInteiros(itens.flatMap((i) => series.map((x) => i[x.chave])))}
            tickFormatter={(v: number) => formatarEixo(v, unidade)}
            domain={referencia !== null ? [0, (max: number) => Math.max(max, referencia)] : undefined}
          />
          <Tooltip
            content={conteudoTooltip}
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
            isAnimationActive={false}
          />
          {temNegativo && <ReferenceLine y={0} stroke="var(--border)" />}
          {referencia !== null && (
            <ReferenceLine
              y={referencia}
              stroke="var(--ref)"
              strokeDasharray={TRACO_REFERENCIA}
              label={{
                value: formatarEixo(referencia, unidade),
                position: 'insideTopRight',
                fill: 'var(--muted-foreground)',
                fontSize: 11,
              }}
            />
          )}
          {estilos.map((s) => {
            const empilhada = !!s.pilha
            const ponta = !empilhada || ultimaDaPilha.get(s.pilha!) === s.chave
            return (
              <Bar
                key={s.chave}
                dataKey={s.chave}
                name={s.nome}
                stackId={s.pilha ?? undefined}
                fill={s.referencia ? `url(#${idHachura})` : s.cor}
                // 2 px de espaço (cor do cartão) entre segmentos empilhados
                stroke={s.referencia ? 'var(--ref)' : empilhada ? 'var(--card)' : undefined}
                strokeWidth={s.referencia ? 1 : empilhada ? 2 : 0}
                radius={ponta ? [4, 4, 0, 0] : 0}
                maxBarSize={48}
                isAnimationActive={!reduzido}
              >
                {itens.map((item, i) => (
                  <Cell key={i} fillOpacity={opacidade(item, s.chave)} />
                ))}
              </Bar>
            )
          })}
        </BarChart>
      </ChartContainer>

      {estilos.length >= 2 && (
        <Legenda itens={estilos.map((s) => ({ chave: s.chave, nome: s.nome, cor: s.cor, referencia: s.referencia }))} />
      )}
      {amostraMinima !== null && itens.some((i) => series.some((s) => amostraPequena(i, s.chave))) && (
        <p className="text-center text-xs text-muted-foreground">
          Barras mais claras: amostra pequena (menos de {numero(amostraMinima)} atividades).
        </p>
      )}
    </div>
  )
}
