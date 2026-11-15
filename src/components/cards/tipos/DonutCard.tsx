import { useMemo } from 'react'
import { Circle, CircleCheck, CircleX, Loader, RotateCcw, type LucideIcon } from 'lucide-react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import type { TooltipPayloadEntry } from 'recharts'

import { CaixaTooltip, Legenda } from '@/components/cards/graficos/comum'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido'
import { unidadeDoDonut } from '@/lib/cards'
import { corDaFatia, estadoDaFatia, type EstadoFatia } from '@/lib/cores'
import { compacto, formatarEixo, formatarPorUnidade, percentual } from '@/lib/formatadores'
import type { DadosDonut, Fatia } from '@/types/api'

/** Ícones das cores de estado: a informação nunca depende só da cor. */
const ICONE_ESTADO: Record<EstadoFatia, LucideIcon> = {
  concluida: CircleCheck,
  andamento: Loader,
  revisao: RotateCcw,
  aberta: Circle,
  recusada: CircleX,
}

interface PropsTooltip {
  active?: boolean
  payload?: ReadonlyArray<TooltipPayloadEntry>
}

export function DonutCard({ dados, codigo }: { dados: DadosDonut; codigo: string }) {
  const reduzido = useMovimentoReduzido()
  const unidade = unidadeDoDonut(codigo, dados)
  const fatias = useMemo(
    () => dados.fatias.map((f, i) => ({ ...f, cor: corDaFatia(f.chave, i), estado: estadoDaFatia(f.chave) })),
    [dados.fatias],
  )

  // Percentual só para exibição na legenda (fatia / total)
  const parcela = (valor: number) => (dados.total > 0 ? percentual(Math.round((valor / dados.total) * 1000) / 10) : '—')

  const config = useMemo<ChartConfig>(
    () => Object.fromEntries(fatias.map((f, i) => [`f${i}`, { label: f.rotulo, color: f.cor }])),
    [fatias],
  )

  const conteudoTooltip = ({ active, payload }: PropsTooltip) => {
    if (!active || !payload?.length) return null
    const fatia = payload[0]?.payload as (Fatia & { cor: string }) | undefined
    if (!fatia) return null
    return (
      <CaixaTooltip
        linhas={[
          { chave: 'valor', nome: fatia.rotulo, cor: fatia.cor, valor: formatarPorUnidade(fatia.valor, unidade) },
        ]}
        rodape={
          <>
            <span>{parcela(fatia.valor)} do total</span>
            {typeof fatia.tokens === 'number' && <span>{compacto(fatia.tokens)} tokens</span>}
          </>
        }
      />
    )
  }

  return (
    <div className="@container flex h-full flex-col">
      <div className="flex flex-1 flex-col items-center gap-4 @md:flex-row">
        <div className="relative w-full max-w-[220px] shrink-0 @md:w-1/2">
          <ChartContainer config={config} className="aspect-square w-full">
            <PieChart accessibilityLayer>
              <Tooltip content={conteudoTooltip} isAnimationActive={false} />
              <Pie
                data={fatias}
                dataKey="valor"
                nameKey="rotulo"
                innerRadius="62%"
                outerRadius="92%"
                stroke="var(--card)"
                strokeWidth={2}
                isAnimationActive={!reduzido}
              >
                {fatias.map((f, i) => (
                  <Cell key={i} fill={f.cor} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">
              {Math.abs(dados.total) < 100_000
                ? formatarPorUnidade(dados.total, unidade)
                : formatarEixo(dados.total, unidade)}
            </span>
            <span className="text-xs text-muted-foreground">total</span>
          </div>
        </div>

        <Legenda
          vertical
          className="w-full @md:flex-1"
          itens={fatias.map((f, i) => {
            const Icone = f.estado ? ICONE_ESTADO[f.estado] : null
            return {
              chave: `${f.chave ?? f.rotulo}-${i}`,
              nome: f.rotulo,
              cor: f.cor,
              icone: Icone ? (
                <Icone className="size-3.5 shrink-0" style={{ color: f.cor }} aria-hidden="true" />
              ) : undefined,
              extra: (
                <>
                  {formatarPorUnidade(f.valor, unidade)}
                  <span className="ml-1.5 font-normal text-muted-foreground">{parcela(f.valor)}</span>
                </>
              ),
            }
          })}
        />
      </div>
    </div>
  )
}
