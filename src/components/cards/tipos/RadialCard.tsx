import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts'

import { DetalheLista } from '@/components/cards/tipos/DetalheLista'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useMovimentoReduzido } from '@/hooks/useMovimentoReduzido'
import { COR_DASH } from '@/lib/cores'
import { formatarPorUnidade } from '@/lib/formatadores'
import type { DadosRadial } from '@/types/api'

const CONFIG: ChartConfig = { valor: { label: 'Valor', color: COR_DASH } }

/** Medidor em semicírculo: valor de 0 a meta. Passar da meta enche o arco; o número mostra o real. */
export function RadialCard({ dados }: { dados: DadosRadial }) {
  const reduzido = useMovimentoReduzido()
  const meta = dados.meta > 0 ? dados.meta : 100
  const preenchido = dados.valor === null ? 0 : Math.min(Math.max(dados.valor, 0), meta)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative mx-auto w-full max-w-[220px]">
        <ChartContainer config={CONFIG} className="aspect-[2/1] w-full">
          <RadialBarChart
            data={[{ valor: preenchido }]}
            startAngle={180}
            endAngle={0}
            cy="100%"
            innerRadius="140%"
            outerRadius="190%"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <PolarAngleAxis type="number" domain={[0, meta]} tick={false} axisLine={false} />
            <RadialBar
              dataKey="valor"
              fill={COR_DASH}
              background={{ fill: 'var(--muted)' }}
              cornerRadius={6}
              isAnimationActive={!reduzido}
            />
          </RadialBarChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">
            {formatarPorUnidade(dados.valor, dados.unidade)}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            de {formatarPorUnidade(meta, dados.unidade)}
          </span>
        </div>
      </div>
      {dados.detalhe && dados.detalhe.length > 0 && <DetalheLista itens={dados.detalhe} />}
    </div>
  )
}
