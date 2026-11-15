import { useMemo } from 'react'

import { FiltroSelect, type OpcaoFiltro } from '@/components/filtros/FiltroSelect'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { rotuloSprint, sprintPadrao } from '@/lib/periodos'
import type { Escopo, OpcoesFiltros } from '@/types/api'

const ESCOPOS: { valor: Escopo; rotulo: string }[] = [
  { valor: 'projeto', rotulo: 'Projeto' },
  { valor: 'time', rotulo: 'Time' },
  { valor: 'sprint', rotulo: 'Sprint' },
]

interface FiltroEscopoProps {
  escopo: Escopo
  id?: number
  opcoes?: OpcoesFiltros
  carregando: boolean
  aoMudar: (valor: { escopo: Escopo; id?: number }) => void
}

/** Projeto | Time | Sprint + o item do escopo. Trocar o escopo limpa o item; Sprint pré-seleciona a atual. */
export function FiltroEscopo({ escopo, id, opcoes, carregando, aoMudar }: FiltroEscopoProps) {
  const itens = useMemo<OpcaoFiltro[]>(() => {
    if (!opcoes) return []
    if (escopo === 'time') return opcoes.times.map((t) => ({ valor: String(t.id), rotulo: t.nome }))
    if (escopo === 'sprint') {
      return [...opcoes.sprints]
        .sort((a, b) => b.inicio.localeCompare(a.inicio) || a.time_nome.localeCompare(b.time_nome))
        .map((s) => ({ valor: String(s.id), rotulo: rotuloSprint(s), detalhe: s.atual ? 'atual' : undefined }))
    }
    return opcoes.projetos.map((p) => ({ valor: String(p.id), rotulo: p.nome }))
  }, [opcoes, escopo])

  const trocarEscopo = (novo: string) => {
    if (!novo || novo === escopo) return
    const valor = novo as Escopo
    if (valor === 'sprint') {
      aoMudar({ escopo: valor, id: opcoes ? sprintPadrao(opcoes.sprints)?.id : undefined })
    } else {
      aoMudar({ escopo: valor })
    }
  }

  const rotuloItem = escopo === 'sprint' ? 'Sprint' : escopo === 'time' ? 'Time' : 'Projeto'
  const textoTodos = escopo === 'time' ? 'Todos os times' : 'Todos os projetos'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={escopo}
        onValueChange={trocarEscopo}
        aria-label="Escopo"
      >
        {ESCOPOS.map((e) => (
          <ToggleGroupItem key={e.valor} value={e.valor} className="px-3 data-[state=on]:font-medium">
            {e.rotulo}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {escopo === 'sprint' ? (
        <FiltroSelect
          rotulo={rotuloItem}
          opcoes={itens}
          obrigatorio
          textoTodos="Escolha"
          carregando={carregando}
          valor={id !== undefined ? String(id) : undefined}
          aoMudar={(v) => aoMudar({ escopo, id: v ? Number(v) : undefined })}
        />
      ) : (
        <FiltroSelect
          rotulo={rotuloItem}
          opcoes={itens}
          textoTodos={textoTodos}
          carregando={carregando}
          valor={id !== undefined ? String(id) : undefined}
          aoMudar={(v) => aoMudar({ escopo, id: v ? Number(v) : undefined })}
        />
      )}
    </div>
  )
}
