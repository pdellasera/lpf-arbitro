import { createContext, useContext, useState, type ReactNode } from 'react'
import { clearSession, readSession, saveSession, type Session } from './session'

interface SessionContextValue {
  session: Session | null
  signIn: (session: Session, remember: boolean) => void
  signOut: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession())

  const signIn = (next: Session, remember: boolean) => {
    try {
      saveSession(next, remember)
    } catch {
      // Si el almacenamiento no está disponible, seguimos con la sesión en memoria.
    }
    setSession(next)
  }

  const signOut = () => {
    clearSession()
    setSession(null)
  }

  return <SessionContext.Provider value={{ session, signIn, signOut }}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>')
  return ctx
}
