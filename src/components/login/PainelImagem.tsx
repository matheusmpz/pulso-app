import { useState } from 'react'

/**
 * Imagem do lado direito do login.
 * Coloque o arquivo em public/imagens/login.jpg (ou troque o caminho abaixo).
 * Enquanto o arquivo não existir, aparece um fundo decorativo no lugar.
 */
export const IMAGEM_LOGIN = '/imagens/login.jpg'

export function PainelImagem() {
  const [falhou, setFalhou] = useState(false)

  return (
    <div className="relative hidden overflow-hidden bg-zinc-950 lg:flex">
      {falhou ? (
        <FundoDecorativo />
      ) : (
        <img
          src={IMAGEM_LOGIN}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          onError={() => setFalhou(true)}
        />
      )}
      {/* Degradê para garantir a leitura da frase sobre qualquer imagem */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
      <p className="relative mt-auto max-w-md p-12 text-3xl leading-tight font-semibold tracking-tight text-white">
        Operação, vendas e IA em um só pulso.
      </p>
    </div>
  )
}

/** Fundo provisório (sem imagem de terceiros): grade sutil e uma onda de pulso na cor da marca. */
function FundoDecorativo() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 size-full"
      viewBox="0 0 800 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="login-grade" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--color-zinc-800)" strokeWidth="1" />
        </pattern>
        <filter id="login-brilho" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <rect width="800" height="900" fill="url(#login-grade)" opacity="0.6" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M0 420h220l30-60 40 150 50-260 50 300 35-130h375"
          stroke="var(--color-yellow-400)"
          strokeWidth="10"
          opacity="0.35"
          filter="url(#login-brilho)"
        />
        <path d="M0 420h220l30-60 40 150 50-260 50 300 35-130h375" stroke="var(--color-yellow-400)" strokeWidth="4" />
      </g>
      <g opacity="0.25">
        <rect x="90" y="600" width="18" height="90" rx="3" fill="var(--color-emerald-400)" />
        <rect x="116" y="560" width="18" height="130" rx="3" fill="var(--color-emerald-400)" />
        <rect x="142" y="620" width="18" height="70" rx="3" fill="var(--color-emerald-400)" />
        <circle cx="400" cy="660" r="44" fill="none" stroke="var(--color-violet-400)" strokeWidth="16" />
        <path d="M560 680l40-40 40 20 50-60" fill="none" stroke="var(--color-orange-400)" strokeWidth="6" />
      </g>
    </svg>
  )
}
