// Peças comuns aos gráficos: eixos, grade, legenda, hachura e tooltip.

import type { ReactNode, SVGProps } from 'react'

import { cn } from '@/lib/utils'

/* ---------- Hachura das séries de referência em barras ---------- */

/** Padrão diagonal: referência nunca depende só da cor. */
export function DefHachura({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="var(--ref)" fillOpacity="0.18" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--ref)" strokeWidth="2.5" />
      </pattern>
    </defs>
  )
}

/* ---------- Legenda ---------- */

export interface ItemLegenda {
  chave: string
  nome: string
  cor: string
  referencia?: boolean
  forma?: 'linha' | 'barra'
  icone?: ReactNode
  /** Texto extra à direita (valor, percentual) */
  extra?: ReactNode
}

function Amostra({ cor, referencia, forma }: Pick<ItemLegenda, 'cor' | 'referencia' | 'forma'>) {
  if (forma === 'linha') {
    return (
      <svg width="16" height="8" aria-hidden="true" className="shrink-0">
        <line
          x1="1"
          y1="4"
          x2="15"
          y2="4"
          stroke={cor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={referencia ? '3 3' : undefined}
        />
      </svg>
    )
  }
  if (referencia) {
    return (
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-[2px] border"
        style={{
          borderColor: cor,
          backgroundImage: `repeating-linear-gradient(45deg, ${cor} 0 1.5px, transparent 1.5px 4px)`,
        }}
      />
    )
  }
  return <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: cor }} />
}

/** Legenda em HTML: acessível e com o segundo código visual (tracejado/hachura/ícone). */
export function Legenda({
  itens,
  className,
  vertical = false,
}: {
  itens: ItemLegenda[]
  className?: string
  vertical?: boolean
}) {
  if (itens.length === 0) return null
  return (
    <ul
      className={cn(
        'flex gap-x-4 gap-y-1.5 text-xs text-muted-foreground',
        vertical ? 'flex-col' : 'flex-wrap justify-center',
        className,
      )}
    >
      {itens.map((item) => (
        <li key={item.chave} className="flex min-w-0 items-center gap-1.5">
          {item.icone ?? <Amostra cor={item.cor} referencia={item.referencia} forma={item.forma} />}
          <span className="truncate text-foreground/80">{item.nome}</span>
          {item.extra && <span className="ml-auto pl-2 font-medium text-foreground tabular-nums">{item.extra}</span>}
        </li>
      ))}
    </ul>
  )
}

/* ---------- Tooltip ---------- */

export interface LinhaTooltip {
  chave: string
  nome: string
  valor: string
  cor?: string
  referencia?: boolean
  nota?: string
}

/** Conteúdo do tooltip no padrão visual do shadcn (ChartTooltipContent). */
export function CaixaTooltip({
  titulo,
  linhas,
  rodape,
}: {
  titulo?: ReactNode
  linhas: LinhaTooltip[]
  rodape?: ReactNode
}) {
  return (
    <div className="grid max-w-[18rem] min-w-[10rem] gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {titulo && <div className="font-medium">{titulo}</div>}
      <div className="grid gap-1.5">
        {linhas.map((l) => (
          <div key={l.chave} className="flex items-center gap-2">
            {l.cor && <Amostra cor={l.cor} referencia={l.referencia} />}
            <div className="flex flex-1 items-center justify-between gap-4 leading-none">
              <span className="text-muted-foreground">{l.nome}</span>
              <span className="font-mono font-medium text-foreground tabular-nums">{l.valor}</span>
            </div>
            {l.nota && <span className="sr-only">{l.nota}</span>}
          </div>
        ))}
      </div>
      {linhas.some((l) => l.nota) && (
        <div className="grid gap-0.5 border-t pt-1.5 text-muted-foreground">
          {linhas
            .filter((l) => l.nota)
            .map((l) => (
              <span key={l.chave}>
                {l.nome}: {l.nota}
              </span>
            ))}
        </div>
      )}
      {rodape && <div className="grid gap-0.5 border-t pt-1.5 text-muted-foreground">{rodape}</div>}
    </div>
  )
}

/* ---------- Rótulos de eixo ---------- */

/** Títulos dos eixos (eixo_y em cima à esquerda, eixo_x embaixo à direita). */
export function TituloEixos({ x, y, children }: { x?: string; y?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {y && <span className="text-xs text-muted-foreground">{y}</span>}
      {children}
      {x && <span className="self-end text-xs text-muted-foreground">{x}</span>}
    </div>
  )
}

/** Tick de categoria com reticências e texto completo no <title>. */
export function TickCategoria({
  x,
  y,
  payload,
  textAnchor = 'middle',
  max = 16,
  extra,
  dx = 0,
  dy = 0,
}: SVGProps<SVGTextElement> & {
  payload?: { value?: unknown }
  max?: number
  extra?: (rotulo: string) => string | null
}) {
  const rotulo = String(payload?.value ?? '')
  // "Sprint 3 · Time Alfa" vira duas linhas: "Sprint 3" / "Time Alfa"
  const [principal, segunda] = rotulo.includes(' · ') ? rotulo.split(' · ', 2) : [rotulo, null]
  const curto = principal.length > max ? `${principal.slice(0, max - 1)}…` : principal
  const complemento = extra?.(rotulo) ?? segunda
  return (
    <g transform={`translate(${Number(x ?? 0)},${Number(y ?? 0)})`}>
      <text
        dx={dx}
        dy={dy}
        textAnchor={textAnchor}
        fill="var(--muted-foreground)"
        fontSize={12}
        dominantBaseline={textAnchor === 'end' ? 'middle' : 'hanging'}
      >
        <title>{rotulo}</title>
        {curto}
        {complemento && (
          <tspan x={0} dx={dx} dy={14} fontSize={11} fill="var(--muted-foreground)" opacity={0.8}>
            {complemento}
          </tspan>
        )}
      </text>
    </g>
  )
}
