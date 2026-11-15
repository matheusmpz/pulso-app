import { useMemo } from 'react'

import { CardShell } from '@/components/cards/CardShell'
import { classeSpan, montarLinhas } from '@/lib/layout-cards'
import type { CardMeta, CardResultado } from '@/types/api'

interface GradeCardsProps {
  metas: CardMeta[]
  resultados?: CardResultado[]
  carregando: boolean
  recarregando: boolean
  pendentes: ReadonlySet<string>
  aoTentarNovamente: (codigo: string) => void
  /** Códigos realçados por atualização em tempo real */
  realces?: ReadonlySet<string>
}

/** Grade de 12 colunas: cada linha soma 12 (ver lib/layout-cards.ts). */
export function GradeCards({
  metas,
  resultados,
  carregando,
  recarregando,
  pendentes,
  aoTentarNovamente,
  realces,
}: GradeCardsProps) {
  const celulas = useMemo(() => montarLinhas(metas).flat(), [metas])
  const porCodigo = useMemo(() => new Map(resultados?.map((r) => [r.codigo, r])), [resultados])

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-12">
      {celulas.map(({ card, span }) => (
        <div key={card.codigo} className={classeSpan(span)}>
          <CardShell
            meta={card}
            resultado={porCodigo.get(card.codigo)}
            carregando={carregando}
            recarregando={recarregando}
            tentando={pendentes.has(card.codigo)}
            aoTentarNovamente={aoTentarNovamente}
            realce={realces?.has(card.codigo)}
          />
        </div>
      ))}
    </div>
  )
}
