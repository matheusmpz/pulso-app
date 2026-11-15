import { OctagonAlert, TriangleAlert, Zap, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatarCelula, numero } from '@/lib/formatadores'
import { cn } from '@/lib/utils'
import type { DadosLista } from '@/types/api'

interface EstiloAlerta {
  Icone: LucideIcon
  classe: string
}

/** Cor/ícone por tipo de alerta (ia-12). O texto sempre acompanha: nada depende só da cor. */
function estiloDoAlerta(texto: string): EstiloAlerta {
  const t = texto.toLowerCase()
  if (t.includes('crític')) {
    return { Icone: OctagonAlert, classe: 'border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-400' }
  }
  if (t.includes('atenç')) {
    return { Icone: TriangleAlert, classe: 'border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-400' }
  }
  return { Icone: Zap, classe: 'border-sky-600/30 bg-sky-600/10 text-sky-700 dark:text-sky-400' }
}

function BadgeAlerta({ texto }: { texto: string }) {
  const { Icone, classe } = estiloDoAlerta(texto)
  return (
    <Badge variant="outline" className={classe}>
      <Icone aria-hidden="true" />
      {texto}
    </Badge>
  )
}

export function ListaCard({ dados }: { dados: DadosLista }) {
  const indiceAlerta = dados.colunas.findIndex((c) => c.toLowerCase() === 'alerta')

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-[300px] overflow-auto rounded-md border [&_[data-slot=table-container]]:overflow-visible">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="hover:bg-transparent">
              {dados.colunas.map((coluna) => (
                <TableHead key={coluna} className="h-9 text-xs text-muted-foreground">
                  {coluna}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.linhas.map((linha, i) => (
              <TableRow key={i}>
                {linha.map((celula, j) => (
                  <TableCell key={j} className={cn('py-1.5 text-sm tabular-nums', j === 0 && 'font-medium')}>
                    {j === indiceAlerta && typeof celula === 'string' ? (
                      <BadgeAlerta texto={celula} />
                    ) : (
                      formatarCelula(celula)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {dados.total > dados.linhas.length && (
        <p className="text-xs text-muted-foreground tabular-nums">
          Mostrando {numero(dados.linhas.length)} de {numero(dados.total)}
        </p>
      )}
    </div>
  )
}
