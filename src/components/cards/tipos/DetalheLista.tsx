import { formatarPorUnidade } from '@/lib/formatadores'
import type { Detalhe } from '@/types/api'

/** Linhas pequenas "rótulo — valor" abaixo do número/medidor. */
export function DetalheLista({ itens }: { itens: Detalhe[] }) {
  return (
    <dl className="flex flex-col gap-1 border-t pt-3 text-sm">
      {itens.map((item) => (
        <div key={item.rotulo} className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{item.rotulo}</dt>
          <dd className="font-medium tabular-nums">{formatarPorUnidade(item.valor, item.unidade)}</dd>
        </div>
      ))}
    </dl>
  )
}
