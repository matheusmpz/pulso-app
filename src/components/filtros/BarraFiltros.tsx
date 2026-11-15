import { useMemo, type ReactNode } from 'react'
import { X } from 'lucide-react'

import { FiltroEscopo } from '@/components/filtros/FiltroEscopo'
import { FiltroPeriodo } from '@/components/filtros/FiltroPeriodo'
import { FiltroSelect, type OpcaoFiltro } from '@/components/filtros/FiltroSelect'
import { Button } from '@/components/ui/button'
import { useOpcoesFiltros } from '@/hooks/useOpcoesFiltros'
import { filtrosDoDashboard, type FiltroId } from '@/lib/filtros-config'
import { temFiltrosAtivos } from '@/lib/filtros'
import type { Filtros, FiltrosAplicados } from '@/types/api'

/** Rótulos das origens de lead (a API envia só o valor). */
const ROTULOS_ORIGEM: Record<string, string> = {
  evento: 'Evento',
  indicacao: 'Indicação',
  linkedin: 'LinkedIn',
  site: 'Site',
}

function rotuloOrigem(valor: string) {
  return ROTULOS_ORIGEM[valor] ?? valor.charAt(0).toUpperCase() + valor.slice(1)
}

interface BarraFiltrosProps {
  chave: string
  filtros: Filtros
  aplicados?: FiltrosAplicados
  aoAlterar: (parcial: Partial<Filtros>) => void
  aoLimpar: () => void
  /** Conteúdo extra à direita (ex.: indicador "Ao vivo") */
  extra?: ReactNode
}

/** Barra única de filtros, montada a partir de lib/filtros-config.ts. */
export function BarraFiltros({ chave, filtros, aplicados, aoAlterar, aoLimpar, extra }: BarraFiltrosProps) {
  const { data: opcoes, isPending } = useOpcoesFiltros()
  const visiveis = filtrosDoDashboard(chave)
  const escopo = filtros.escopo ?? 'projeto'

  const listas = useMemo<Record<'tipo_projeto' | 'status_projeto' | 'origem_lead' | 'modelo', OpcaoFiltro[]>>(
    () => ({
      tipo_projeto: opcoes?.tipos_projeto.map((o) => ({ valor: o.valor, rotulo: o.rotulo })) ?? [],
      status_projeto: opcoes?.status_projeto.map((o) => ({ valor: o.valor, rotulo: o.rotulo })) ?? [],
      origem_lead: opcoes?.origens.map((o) => ({ valor: o, rotulo: rotuloOrigem(o) })) ?? [],
      modelo: opcoes?.modelos.map((o) => ({ valor: o, rotulo: o })) ?? [],
    }),
    [opcoes],
  )

  const ROTULOS: Record<Exclude<FiltroId, 'escopo' | 'periodo'>, string> = {
    tipo_projeto: 'Tipo de projeto',
    status_projeto: 'Status',
    origem_lead: 'Origem do lead',
    modelo: 'Modelo de IA',
  }

  return (
    <div className="sticky top-14 z-10 -mx-4 border-b bg-background/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/70 md:-mx-6 md:px-6">
      <div className="flex flex-wrap items-center gap-2">
        {visiveis.map((filtro) => {
          if (filtro === 'escopo') {
            return (
              <FiltroEscopo
                key={filtro}
                escopo={escopo}
                id={filtros.id}
                opcoes={opcoes}
                carregando={isPending}
                aoMudar={(v) => aoAlterar({ escopo: v.escopo, id: v.id })}
              />
            )
          }
          if (filtro === 'periodo') {
            return (
              <FiltroPeriodo
                key={filtro}
                de={filtros.de}
                ate={filtros.ate}
                aplicadoDe={aplicados?.de}
                aplicadoAte={aplicados?.ate}
                desabilitado={escopo === 'sprint'}
                motivoDesabilitado="No escopo Sprint o período é o da sprint."
                aoMudar={(p) => aoAlterar({ de: p.de, ate: p.ate })}
              />
            )
          }
          return (
            <FiltroSelect
              key={filtro}
              multiplo
              rotulo={ROTULOS[filtro]}
              opcoes={listas[filtro]}
              carregando={isPending}
              valor={filtros[filtro]}
              aoMudar={(v) => aoAlterar({ [filtro]: v })}
            />
          )
        })}

        {temFiltrosAtivos(filtros) && (
          <Button variant="ghost" size="sm" onClick={aoLimpar} className="text-muted-foreground">
            <X />
            Limpar filtros
          </Button>
        )}

        {extra && <div className="ml-auto flex items-center">{extra}</div>}
      </div>
    </div>
  )
}
