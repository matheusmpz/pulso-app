import { Toaster as Sonner, type ToasterProps } from 'sonner'

import { useTema } from '@/hooks/useTema'

// Ajuste de tema: o shadcn usa next-themes; aqui o tema vem do TemaProvider do Pulso.
function Toaster({ ...props }: ToasterProps) {
  const { temaEfetivo } = useTema()

  return (
    <Sonner
      theme={temaEfetivo === 'escuro' ? 'dark' : 'light'}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
