import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { EstadoTempoReal, StatusTempoReal } from '@/lib/tempo-real'
import { cn } from '@/lib/utils'

const APARENCIA: Record<StatusTempoReal, { texto: string; ponto: string; dica: string; pulsa?: boolean }> = {
  ao_vivo: {
    texto: 'Ao vivo',
    ponto: 'bg-emerald-500',
    dica: 'Os cards se atualizam sozinhos quando chegam dados novos.',
    pulsa: true,
  },
  conectando: { texto: 'Conectando…', ponto: 'bg-amber-500', dica: 'Abrindo a conexão de tempo real.' },
  reconectando: {
    texto: 'Reconectando…',
    ponto: 'bg-amber-500',
    dica: 'A conexão caiu. Tentando de novo; ao voltar, os dados são recarregados.',
  },
  offline: {
    texto: 'Offline',
    ponto: 'bg-zinc-400',
    dica: 'Sem conexão de tempo real. Continuamos tentando a cada 30 segundos.',
  },
  desconectado: { texto: 'Offline', ponto: 'bg-zinc-400', dica: 'Sem conexão de tempo real.' },
}

/** Indicador de tempo real: o único lugar em que o "pulso" ganha animação. */
export function StatusAoVivo({ estado }: { estado: EstadoTempoReal }) {
  const a = APARENCIA[estado.status]
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="status"
          aria-live="polite"
          tabIndex={0}
          className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="relative flex size-2" aria-hidden="true">
            {a.pulsa && <span className={cn('pulso-ponto absolute inline-flex size-full rounded-full', a.ponto)} />}
            <span className={cn('relative inline-flex size-2 rounded-full', a.ponto)} />
          </span>
          {a.texto}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-64">
        {a.dica}
        {estado.erro && <span className="mt-1 block opacity-80">{estado.erro}</span>}
      </TooltipContent>
    </Tooltip>
  )
}
