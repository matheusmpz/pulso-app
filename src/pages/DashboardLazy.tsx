import { lazy, Suspense } from 'react'

import { Spinner } from '@/components/ui/spinner'

// O Recharts é pesado: a tela de dashboard é carregada sob demanda.
const Dashboard = lazy(() => import('@/pages/Dashboard'))

export default function DashboardLazy() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-24 text-muted-foreground">
          <Spinner className="size-6" />
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  )
}
