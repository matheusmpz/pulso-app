import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface OpcaoFiltro {
  valor: string
  rotulo: string
  /** Texto auxiliar à direita (ex.: "atual") */
  detalhe?: string
}

interface Base {
  rotulo: string
  opcoes: OpcaoFiltro[]
  /** Texto quando nada está selecionado */
  textoTodos?: string
  desabilitado?: boolean
  carregando?: boolean
  className?: string
}

interface Unico extends Base {
  multiplo?: false
  valor: string | undefined
  aoMudar: (valor: string | undefined) => void
  /** Sem opção "todos" (ex.: sprint é obrigatória) */
  obrigatorio?: boolean
}

interface Multiplo extends Base {
  multiplo: true
  valor: string[] | undefined
  aoMudar: (valor: string[] | undefined) => void
}

export type FiltroSelectProps = Unico | Multiplo

/**
 * Seletor de filtro: botão "Rótulo: valor" que abre uma lista com busca.
 * Seleção única aplica na hora; múltipla aplica ao fechar (uma requisição só).
 * Todo o visual do seletor está neste componente.
 */
export function FiltroSelect(props: FiltroSelectProps) {
  const { rotulo, opcoes, textoTodos = 'Todos', desabilitado, carregando, className } = props
  const [aberto, setAberto] = useState(false)
  const [rascunho, setRascunho] = useState<string[]>([])

  const selecionados = props.multiplo ? (props.valor ?? []) : props.valor ? [props.valor] : []
  const rotuloDe = (v: string) => opcoes.find((o) => o.valor === v)?.rotulo ?? v

  const resumo =
    selecionados.length === 0
      ? textoTodos
      : selecionados.length === 1
        ? rotuloDe(selecionados[0])
        : `${rotuloDe(selecionados[0])} +${selecionados.length - 1}`

  const mudarAbertura = (novo: boolean) => {
    if (props.multiplo) {
      if (novo) {
        setRascunho(props.valor ?? [])
      } else {
        // Aplica ao fechar, só se mudou
        const atual = [...(props.valor ?? [])].sort().join(',')
        const proximo = [...rascunho].sort().join(',')
        if (atual !== proximo) props.aoMudar(rascunho.length > 0 ? rascunho : undefined)
      }
    }
    setAberto(novo)
  }

  const alternar = (valor: string) =>
    setRascunho((r) => (r.includes(valor) ? r.filter((v) => v !== valor) : [...r, valor]))

  const escolherUnico = (valor: string | undefined) => {
    if (!props.multiplo) props.aoMudar(valor)
    setAberto(false)
  }

  return (
    <Popover open={aberto} onOpenChange={mudarAbertura}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={desabilitado || carregando}
          aria-label={`${rotulo}: ${resumo}`}
          className={cn('max-w-full justify-between gap-1.5 font-normal', className)}
        >
          <span className="text-muted-foreground">{rotulo}:</span>
          <span className={cn('truncate font-medium', selecionados.length > 0 && 'text-foreground')}>{resumo}</span>
          <ChevronDown className="ml-0.5 size-3.5 text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          {opcoes.length > 6 && <CommandInput placeholder={`Buscar ${rotulo.toLowerCase()}…`} />}
          <CommandList>
            <CommandEmpty>Nada encontrado.</CommandEmpty>
            <CommandGroup>
              {!props.multiplo && !props.obrigatorio && (
                <CommandItem value={`__todos__ ${textoTodos}`} onSelect={() => escolherUnico(undefined)}>
                  <Check className={cn('size-4', selecionados.length === 0 ? 'opacity-100' : 'opacity-0')} />
                  {textoTodos}
                </CommandItem>
              )}
              {opcoes.map((opcao) => {
                const marcado = props.multiplo ? rascunho.includes(opcao.valor) : selecionados.includes(opcao.valor)
                return (
                  <CommandItem
                    key={opcao.valor}
                    value={`${opcao.rotulo} ${opcao.valor}`}
                    onSelect={() => (props.multiplo ? alternar(opcao.valor) : escolherUnico(opcao.valor))}
                    aria-checked={marcado}
                  >
                    {props.multiplo ? (
                      <Checkbox checked={marcado} tabIndex={-1} aria-hidden="true" className="pointer-events-none" />
                    ) : (
                      <Check className={cn('size-4', marcado ? 'opacity-100' : 'opacity-0')} />
                    )}
                    <span className="flex-1 truncate">{opcao.rotulo}</span>
                    {opcao.detalhe && <span className="text-xs text-muted-foreground">{opcao.detalhe}</span>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          {props.multiplo && (
            <>
              <CommandSeparator />
              <div className="flex items-center justify-between gap-2 p-1.5">
                <Button variant="ghost" size="sm" onClick={() => setRascunho([])} disabled={rascunho.length === 0}>
                  Limpar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => mudarAbertura(false)}>
                  Aplicar
                </Button>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
