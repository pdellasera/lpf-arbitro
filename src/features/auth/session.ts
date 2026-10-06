export interface SessionUser {
  id: string
  name: string
  role: 'arbitro' | 'comisionado'
}

export interface Session {
  token: string
  user: SessionUser
}

const KEY = 'lpf-session'

/** Lee la sesión desde localStorage (recordarme) o sessionStorage. */
export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

/** Persiste la sesión según la preferencia de "recordarme". */
export function saveSession(session: Session, remember: boolean): void {
  const raw = JSON.stringify(session)
  if (remember) {
    localStorage.setItem(KEY, raw)
    sessionStorage.removeItem(KEY)
  } else {
    sessionStorage.setItem(KEY, raw)
    localStorage.removeItem(KEY)
  }
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}
