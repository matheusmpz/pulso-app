import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { DetalheLista } from '@/components/cards/tipos/DetalheLista'
import { formatarPorUnidade, variacaoPercentual } from '@/lib/formatadores'
import type { DadosNumero } from '@/types/api'

export function NumeroCard({ dados }: { dados: DadosNumero }) {
  const variacao = dados.variacao?.valor ?? null
  const IconeVariacao = variacao === null || variacao === 0 ? Minus : variacao > 0 ? TrendingUp : TrendingDown

  return (
    <div className="flex flex-col gap-3">
      <p className="text-4xl font-semibold tracking-tight tabular-nums">
        {formatarPorUnidade(dados.valor, dados.unidade)}
      </p>

      {dados.variacao && (
        // Cinza neutro: "subir" é bom para receita e ruim para custo, e a API não informa o sentido.
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconeVariacao className="size-4" aria-hidden="true" />
          <span className="tabular-nums">{variacaoPercentual(variacao)}</span>
          <span>vs. período anterior</span>
        </p>
      )}

      {dados.detalhe && dados.detalhe.length > 0 && <DetalheLista itens={dados.detalhe} />}
    </div>
  )
}
