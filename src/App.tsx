import { Logo } from '@/components/layout/Logo'
import { TemaProvider } from '@/components/layout/TemaProvider'

export default function App() {
  return (
    <TemaProvider>
      <main className="flex min-h-svh items-center justify-center">
        <Logo />
      </main>
    </TemaProvider>
  )
}
