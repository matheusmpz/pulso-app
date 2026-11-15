import { memo } from 'react'
import { CalendarX2, CircleCheck } from 'lucide-react'

import { CardErro, CardSkeleton, CardVazio } from '@/components/cards/CardEstados'
import { CardInfoDialog } from '@/components/cards/CardInfoDialog'
import { CardRenderer } from '@/components/cards/CardRenderer'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { badgeDoCard, cardVazio, semSprint, subtituloDoCard } from '@/lib/cards'
import { cn } from '@/lib/utils'
import type { CardMeta, CardResultado } from '@/types/api'

export interface CardShellProps {
  meta: CardMeta
  /** Resultado do card (ausente na primeira carga) */
  resultado?: CardResultado
  /** Primeira carga: mostra o esqueleto */
  carregando: boolean
  /** Filtro mudou: dados antigos + spinner no cabeçalho */
  recarregando: boolean
  /** Realce de atualização em tempo real */
  realce?: boolean
  tentando?: boolean
  aoTentarNovamente?: (codigo: string) => void
  /** Mensagem quando não há resultado (ex.: filtro inválido) */
  mensagemSemResultado?: string
  className?: string
}

function CardShellBase({
  meta,
  resultado,
  carregando,
  recarregando,
  realce,
  tentando,
  aoTentarNovamente,
  mensagemSemResultado,
  className,
}: CardShellProps) {
  const titulo = resultado?.titulo || meta.titulo
  const tipo = resultado?.tipo ?? meta.tipo
  const subtitulo = subtituloDoCard(resultado)
  const badge = badgeDoCard(resultado)
  const alerta = resultado?.alerta ?? null
  const compacto = tipo === 'numero' || tipo === 'radial'

  return (
    <Card
      data-codigo={meta.codigo}
      aria-busy={carregando || recarregando || undefined}
      className={cn(
        'h-full gap-3 py-4 transition-[border-color]',
        // Gancho para o futuro: alerta preenchido tinge a borda
        alerta?.nivel === 'atencao' && 'border-amber-500/70',
        alerta?.nivel === 'critico' && 'border-red-500/70',
        realce && 'realce-card',
        className,
      )}
    >
      <header className="flex items-start gap-1.5 px-4">
        <CardInfoDialog titulo={titulo} descricao={meta.descricao} atualizadoEm={resultado?.atualizado_em} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm leading-5 font-medium" title={titulo}>
            {titulo}
          </h3>
          {subtitulo && <p className="truncate text-xs text-muted-foreground">{subtitulo}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {(recarregando || tentando) && <Spinner className="size-3.5 text-muted-foreground" />}
          {alerta && (
            <Badge variant={alerta.nivel === 'critico' ? 'destructive' : 'secondary'}>
              {alerta.mensagem ?? (alerta.nivel === 'critico' ? 'Crítico' : 'Atenção')}
            </Badge>
          )}
          {badge && (
            <Badge variant="secondary" className="tabular-nums">
              {badge}
            </Badge>
          )}
        </div>
      </header>

      <div className={cn('flex flex-1 flex-col px-4', compacto && 'justify-center')}>
        <ConteudoCard
          meta={meta}
          resultado={resultado}
          carregando={carregando}
          tentando={tentando}
          aoTentarNovamente={aoTentarNovamente}
          mensagemSemResultado={mensagemSemResultado}
        />
      </div>
    </Card>
  )
}

function ConteudoCard({
  meta,
  resultado,
  carregando,
  tentando,
  aoTentarNovamente,
  mensagemSemResultado,
}: Pick<
  CardShellProps,
  'meta' | 'resultado' | 'carregando' | 'tentando' | 'aoTentarNovamente' | 'mensagemSemResultado'
>) {
  if (!resultado) {
    return carregando ? <CardSkeleton tipo={meta.tipo} /> : <CardVazio mensagem={mensagemSemResultado} />
  }
  if (resultado.erro || resultado.dados === undefined) {
    return (
      <CardErro
        mensagem={resultado.erro}
        tentando={tentando}
        aoTentarNovamente={aoTentarNovamente ? () => aoTentarNovamente(meta.codigo) : undefined}
      />
    )
  }
  if (semSprint(resultado)) {
    return <CardVazio icone={<CalendarX2 className="size-6" />} mensagem="Nenhuma sprint no filtro selecionado." />
  }
  if (cardVazio(resultado.tipo, resultado.dados)) {
    return resultado.tipo === 'lista' ? (
      <CardVazio icone={<CircleCheck className="size-6" />} mensagem="Nenhum alerta no período." />
    ) : (
      <CardVazio />
    )
  }
  return <CardRenderer tipo={resultado.tipo} dados={resultado.dados} codigo={resultado.codigo} />
}

/** Moldura única de todos os cards. Memo: a atualização de um card não redesenha os outros. */
export const CardShell = memo(CardShellBase)
