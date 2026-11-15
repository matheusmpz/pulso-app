import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'

import { TemaProvider } from '@/components/layout/TemaProvider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query'
import { roteador } from '@/rotas'

export default function App() {
  return (
    <TemaProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <RouterProvider router={roteador} />
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </QueryClientProvider>
    </TemaProvider>
  )
}
