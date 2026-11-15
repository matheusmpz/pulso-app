// Sessão do usuário: token e expiração no localStorage (chave "pulso-token").
// Todo acesso ao storage é protegido com try/catch: o app funciona mesmo se o storage falhar.

const CHAVE_SESSAO = 'pulso-token'

export interface Sessao {
  token: string
  /** ISO 8601 */
  expiraEm: string
}

/** Lê o campo "exp" (segundos) do JWT. Não valida a assinatura: isso é papel da API. */
export function expiracaoDoJwt(token: string): string | null {
  try {
    const partes = token.split('.')
    if (partes.length !== 3) return null
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='))) as {
      exp?: unknown
    }
    return typeof json.exp === 'number' ? new Date(json.exp * 1000).toISOString() : null
  } catch {
    return null
  }
}

export function sessaoExpirada(sessao: Sessao, agora: Date = new Date()): boolean {
  const expira = new Date(sessao.expiraEm).getTime()
  return Number.isNaN(expira) || expira <= agora.getTime()
}

export function lerSessao(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO)
    if (!bruto) return null
    const sessao = JSON.parse(bruto) as Partial<Sessao>
    if (typeof sessao.token !== 'string' || typeof sessao.expiraEm !== 'string') return null
    const completa: Sessao = { token: sessao.token, expiraEm: sessao.expiraEm }
    return sessaoExpirada(completa) ? null : completa
  } catch {
    return null
  }
}

export function salvarSessao(sessao: Sessao): void {
  try {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
  } catch {
    // Sem storage: a sessão vale só enquanto a aba estiver aberta.
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(CHAVE_SESSAO)
  } catch {
    // ignora
  }
}

/** Iniciais para o avatar: "Matheus Pereira" → "MP"; "Diretoria (dev)" → "DD". */
export function iniciais(nome: string): string {
  const partes = nome
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome
}

const ROTULOS_PERFIL: Record<string, string> = {
  diretoria: 'Diretoria',
  lider_tecnologia: 'Líder de tecnologia',
}

export function rotuloPerfil(nome: string): string {
  if (ROTULOS_PERFIL[nome]) return ROTULOS_PERFIL[nome]
  const texto = nome.replace(/_/g, ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
