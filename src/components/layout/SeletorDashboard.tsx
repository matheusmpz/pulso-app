import { Check, ChevronsUpDown } from 'lucide-react'
import { Link, useMatch, useSearchParams } from 'react-router'

import { IconeDashboard } from '@/components/dashboard/IconeDashboard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useDashboards } from '@/hooks/useDashboards'
import { corDoDashboard } from '@/lib/cores'
import { filtrosParaOutroDashboard } from '@/lib/filtros'

/**
 * Nome do dashboard atual no cabeçalho, com ícone na cor dele.
 * Abre um menu para trocar de dashboard, levando só os filtros que valem no destino.
 */
export function SeletorDashboard() {
  const rota = useMatch('/dashboards/:chave')
  const [params] = useSearchParams()
  const { data: dashboards } = useDashboards()

  const chaveAtual = rota?.params.chave
  if (!chaveAtual || !dashboards) return null
  const atual = dashboards.find((d) => d.chave === chaveAtual)
  if (!atual) return null

  return (
    <>
      <Separator orientation="vertical" className="mx-1 h-5!" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2" data-cor={corDoDashboard(atual)}>
            <IconeDashboard chave={atual.chave} className="text-dash" />
            <span className="max-w-[40vw] truncate font-medium">{atual.titulo}</span>
            <ChevronsUpDown className="text-muted-foreground" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Dashboards</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {dashboards.map((d) => {
            const qs = filtrosParaOutroDashboard(params, chaveAtual, d.chave)
            return (
              <DropdownMenuItem key={d.chave} asChild data-cor={corDoDashboard(d)}>
                <Link to={`/dashboards/${d.chave}${qs ? `?${qs}` : ''}`}>
                  <IconeDashboard chave={d.chave} className="text-dash" />
                  <span className="flex-1">{d.titulo}</span>
                  {d.chave === chaveAtual && <Check className="text-muted-foreground" />}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
