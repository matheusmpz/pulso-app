import { CalendarClock, OctagonAlert } from 'lucide-react'

import { dataLonga, dias, formatarPorUnidade } from '@/lib/formatadores'

interface Projecao {
  media_diaria?: number | null
  restante?: number | null
  dias_restantes?: number | null
  data_esgotamento?: string | null
  esgotada?: boolean
}

function lerProjecao(valor: unknown): Projecao | null {
  return valor && typeof valor === 'object' ? (valor as Projecao) : null
}

/** ia-05: bloco de projeção a partir de extra.projecao (a API já calculou tudo). */
export function ProjecaoQuota({ projecao: bruto, unidade }: { projecao: unknown; unidade?: string }) {
  const projecao = lerProjecao(bruto)
  if (!projecao) return null

  if (projecao.esgotada) {
    return (
      <p className="flex items-center gap-2 rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400">
        <OctagonAlert className="size-4 shrink-0" aria-hidden="true" />
        Quota esgotada
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1 rounded-md bg-muted/60 px-3 py-2 text-sm">
      <p className="flex items-center gap-2 font-medium">
        <CalendarClock className="size-4 shrink-0 text-dash" aria-hidden="true" />
        {projecao.data_esgotamento
          ? `Com o ritmo atual, a quota acaba em ${dataLonga(projecao.data_esgotamento)}`
          : 'Sem previsão de esgotamento da quota no ritmo atual'}
      </p>
      <p className="text-xs text-muted-foreground tabular-nums">
        Média diária: {formatarPorUnidade(projecao.media_diaria ?? null, unidade)} · Restante:{' '}
        {formatarPorUnidade(projecao.restante ?? null, unidade)}
        {projecao.dias_restantes !== null && projecao.dias_restantes !== undefined
          ? ` · ${dias(projecao.dias_restantes)}`
          : ''}
      </p>
    </div>
  )
}
