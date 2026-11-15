import type { ReactNode } from 'react'
import { ChartNoAxesColumn, RotateCcw, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ALTURA_POR_TIPO } from '@/components/cards/alturas'
import type { TipoCard } from '@/types/api'

/** Esqueleto com a silhueta do tipo (bloco para número, área de gráfico para os demais). */
export function CardSkeleton({ tipo }: { tipo: TipoCard }) {
  if (tipo === 'numero' || tipo === 'radial') {
    return (
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    )
  }
  return <Skeleton aria-hidden="true" className="w-full rounded-lg" style={{ height: ALTURA_POR_TIPO[tipo] }} />
}

export function CardVazio({ mensagem, icone }: { mensagem?: string; icone?: ReactNode }) {
  return (
    <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
      <span className="text-muted-foreground/60">{icone ?? <ChartNoAxesColumn className="size-6" />}</span>
      <p>{mensagem ?? 'Sem dados para os filtros selecionados.'}</p>
    </div>
  )
}

export function CardErro({
  mensagem,
  aoTentarNovamente,
  tentando,
}: {
  mensagem?: string
  aoTentarNovamente?: () => void
  tentando?: boolean
}) {
  return (
    <div
      role="alert"
      className="flex min-h-32 flex-1 flex-col items-center justify-center gap-3 py-6 text-center text-sm"
    >
      <TriangleAlert className="size-6 text-destructive" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">Não foi possível carregar este card.</p>
        {mensagem && <p className="text-xs text-muted-foreground">{mensagem}</p>}
      </div>
      {aoTentarNovamente && (
        <Button variant="outline" size="sm" onClick={aoTentarNovamente} disabled={tentando}>
          {tentando ? <Spinner /> : <RotateCcw />}
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
