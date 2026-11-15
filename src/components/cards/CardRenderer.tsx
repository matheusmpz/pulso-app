import { createElement, type ComponentType } from 'react'

import { CardErro } from '@/components/cards/CardEstados'
import { REGISTRO_TIPOS } from '@/components/cards/registro'
import type { TipoCard } from '@/types/api'

export interface PropsRenderer<D = unknown> {
  dados: D
  codigo: string
}

/**
 * Registro tipo → componente. Um card novo na API, de um tipo já existente, aparece sem mexer no front.
 * Ajustes de cards especiais são dirigidos pelos dados (chaves extras), não pelo código do card.
 */
export function CardRenderer({ tipo, dados, codigo }: { tipo: TipoCard; dados: unknown; codigo: string }) {
  const componente = REGISTRO_TIPOS[tipo] as ComponentType<PropsRenderer> | undefined
  if (!componente) return <CardErro mensagem="Tipo de card não suportado." />
  return createElement(componente, { dados, codigo })
}
