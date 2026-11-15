import { useState } from 'react'
import { ptBR } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { intervalo } from '@/lib/formatadores'
import { ATALHOS, atalhoAtivo, deIso, paraIso } from '@/lib/periodos'
import { cn } from '@/lib/utils'

interface FiltroPeriodoProps {
  de?: string
  ate?: string
  /** Período efetivo aplicado pela API (padrão ou da sprint) */
  aplicadoDe?: string
  aplicadoAte?: string
  /** Escopo sprint: período fixo nas datas da sprint */
  desabilitado?: boolean
  motivoDesabilitado?: string
  aoMudar: (periodo: { de?: string; ate?: string }) => void
}

export function FiltroPeriodo({
  de,
  ate,
  aplicadoDe,
  aplicadoAte,
  desabilitado,
  motivoDesabilitado,
  aoMudar,
}: FiltroPeriodoProps) {
  const [aberto, setAberto] = useState(false)
  const [rascunho, setRascunho] = useState<DateRange | undefined>()
  const doisMeses = useMediaQuery('(min-width: 768px)')

  const exibirDe = desabilitado ? aplicadoDe : (de ?? aplicadoDe)
  const exibirAte = desabilitado ? aplicadoAte : (ate ?? aplicadoAte)
  const texto = exibirDe && exibirAte ? intervalo(exibirDe, exibirAte) : 'Últimos 30 dias'
  const ativo = atalhoAtivo(de, ate)

  const mudarAbertura = (novo: boolean) => {
    if (novo) setRascunho(de && ate ? { from: deIso(de), to: deIso(ate) } : undefined)
    setAberto(novo)
  }

  const aplicar = (periodo: { de?: string; ate?: string }) => {
    aoMudar(periodo)
    setAberto(false)
  }

  // Dois cliques: o primeiro marca o início; o segundo fecha o intervalo e aplica.
  const aoSelecionar = (_faixa: DateRange | undefined, dia: Date) => {
    const inicio = rascunho?.from && !rascunho.to ? rascunho.from : null
    if (!inicio) {
      setRascunho({ from: dia, to: undefined })
      return
    }
    const [a, b] = inicio <= dia ? [inicio, dia] : [dia, inicio]
    aplicar({ de: paraIso(a), ate: paraIso(b) })
  }

  return (
    <Popover open={aberto} onOpenChange={mudarAbertura}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={desabilitado}
          title={desabilitado ? motivoDesabilitado : undefined}
          aria-label={`Período: ${texto}`}
          className="gap-1.5 font-normal"
        >
          <CalendarDays className="text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">Período:</span>
          <span className="font-medium tabular-nums">{texto}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex flex-col md:flex-row">
          <ul className="flex flex-row flex-wrap gap-1 border-b p-2 md:w-40 md:flex-col md:border-r md:border-b-0">
            {ATALHOS.map((atalho) => (
              <li key={atalho.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('w-full justify-start font-normal', ativo === atalho.id && 'bg-accent font-medium')}
                  onClick={() => aplicar(atalho.intervalo(new Date()))}
                >
                  {atalho.rotulo}
                </Button>
              </li>
            ))}
            <li className="md:mt-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal text-muted-foreground"
                onClick={() => aplicar({})}
                disabled={!de && !ate}
              >
                Padrão
              </Button>
            </li>
          </ul>
          <div className="flex flex-col">
            <Calendar
              mode="range"
              locale={ptBR}
              numberOfMonths={doisMeses ? 2 : 1}
              defaultMonth={rascunho?.from ?? (exibirAte ? deIso(exibirAte) : new Date())}
              selected={rascunho}
              onSelect={aoSelecionar}
              disabled={{ after: new Date() }}
              autoFocus
            />
            <p className="px-3 pb-3 text-xs text-muted-foreground" aria-live="polite">
              {rascunho?.from && !rascunho.to ? 'Agora escolha a data final.' : 'Escolha a data inicial e a final.'}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
