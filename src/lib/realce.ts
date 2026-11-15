// Realce rápido do card que acabou de receber atualização em tempo real (~600 ms).
// Store mínima por código: só o card afetado redesenha.

const DURACAO_MS = 600

const ativos = new Set<string>()
const ouvintes = new Map<string, Set<() => void>>()
const timers = new Map<string, number>()

function avisar(codigo: string) {
  ouvintes.get(codigo)?.forEach((o) => o())
}

export function emitirRealce(codigo: string) {
  window.clearTimeout(timers.get(codigo))
  // Reinicia a animação se o card já estava realçado
  if (ativos.delete(codigo)) avisar(codigo)
  requestAnimationFrame(() => {
    ativos.add(codigo)
    avisar(codigo)
    timers.set(
      codigo,
      window.setTimeout(() => {
        ativos.delete(codigo)
        avisar(codigo)
      }, DURACAO_MS),
    )
  })
}

export function inscreverRealce(codigo: string, ouvinte: () => void): () => void {
  let lista = ouvintes.get(codigo)
  if (!lista) {
    lista = new Set()
    ouvintes.set(codigo, lista)
  }
  lista.add(ouvinte)
  return () => lista.delete(ouvinte)
}

export function realceAtivo(codigo: string): boolean {
  return ativos.has(codigo)
}
