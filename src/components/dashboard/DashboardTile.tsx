import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import { IconeDashboard } from '@/components/dashboard/IconeDashboard'
import { Badge } from '@/components/ui/badge'
import { corDoDashboard } from '@/lib/cores'
import { cn } from '@/lib/utils'
import type { DashboardResumo } from '@/types/api'

export function DashboardTile({ dashboard }: { dashboard: DashboardResumo }) {
  return (
    <Link
      to={`/dashboards/${dashboard.chave}`}
      data-cor={corDoDashboard(dashboard)}
      className={cn(
        'group flex h-full flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-xs transition-all outline-none dark:shadow-none',
        'hover:-translate-y-0.5 hover:border-dash motion-reduce:hover:translate-y-0',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-dash/10 text-dash">
          <IconeDashboard chave={dashboard.chave} className="size-5" />
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-dash motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <h2 className="text-lg font-semibold">{dashboard.titulo}</h2>
        <p className="text-sm text-muted-foreground">{dashboard.descricao}</p>
      </div>
      <Badge variant="secondary" className="tabular-nums">
        {dashboard.total_cards} {dashboard.total_cards === 1 ? 'card' : 'cards'}
      </Badge>
    </Link>
  )
}
