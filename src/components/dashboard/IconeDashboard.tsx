import { createElement } from 'react'
import type { LucideProps } from 'lucide-react'

import { iconeDoDashboard } from '@/lib/dashboards'

/** Ícone do dashboard pela chave (mapa único em lib/dashboards.ts). */
export function IconeDashboard({ chave, ...props }: LucideProps & { chave: string }) {
  return createElement(iconeDoDashboard(chave), { 'aria-hidden': true, ...props })
}
