import { useState } from 'react'
import { DesktopNotice } from '@/features/auth/components/DesktopNotice'
import { LoginScreen } from '@/features/auth/components/LoginScreen'
import { RoleSelectScreen } from '@/features/auth/components/RoleSelectScreen'
import { useSession } from '@/features/auth/SessionProvider'
import { HomeScreen } from '@/features/matches/components/HomeScreen'
import { MatchDetailScreen } from '@/features/matches/components/MatchDetailScreen'
import { LoadLineupScreen } from '@/features/match-control/components/LoadLineupScreen'
import { PortraitLiveMatchScreen } from '@/features/match-control/components/PortraitLiveMatchScreen'
import { PreMatchChecklistScreen } from '@/features/commissioner/components/PreMatchChecklistScreen'
import { MatchStartScreen } from '@/features/commissioner/components/MatchStartScreen'
import { InstallModal } from '@/features/pwa/components/InstallModal'
import { PwaDebugPanel } from '@/features/pwa/components/PwaDebugPanel'
import { usePwaInstall } from '@/features/pwa/hooks/usePwaInstall'
import type { Match } from '@/features/matches/types'

export default function App() {
  const { session } = useSession()
  const [view, setView] = useState<'home' | 'pre' | 'start' | 'lineup' | 'detail' | 'match'>('home')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [appRole, setAppRole] = useState<'arbitro' | 'comisionado' | null>(null)
  const pwa = usePwaInstall()

  // Rol efectivo: tras el login viene de la sesión (persistente); antes, de la
  // selección en el selector de rol. Así el rol sobrevive a recargas de página.
  const role: 'arbitro' | 'comisionado' = session
    ? session.user.role === 'comisionado'
      ? 'comisionado'
      : 'arbitro'
    : (appRole ?? 'arbitro')

  return (
    <>
      {/* App: solo móvil y tablet (táctil). Oculto en pantallas grandes con puntero fino. */}
      <div className="lg:pointer-fine:hidden">
        {session ? (
          view === 'home' ? (
            <HomeScreen
              role={role}
              onOpenMatch={(match) => {
                setSelectedMatch(match)
                // Comisionado: Lista Previa · Árbitro: Detalle del partido.
                setView(role === 'comisionado' ? 'pre' : 'detail')
              }}
            />
          ) : view === 'pre' && selectedMatch ? (
            <PreMatchChecklistScreen
              onBack={() => setView('home')}
              onNext={() => setView('start')}
            />
          ) : view === 'start' && selectedMatch ? (
            <MatchStartScreen
              onBack={() => setView('pre')}
              onNext={() => setView('match')}
            />
          ) : view === 'lineup' && selectedMatch ? (
            <LoadLineupScreen
              match={selectedMatch}
              onBack={() => setView('detail')}
              onNext={() => setView('match')}
            />
          ) : view === 'detail' && selectedMatch ? (
            <MatchDetailScreen
              match={selectedMatch}
              onBack={() => setView('home')}
              onNext={() => setView('lineup')}
            />
          ) : selectedMatch ? (
            <PortraitLiveMatchScreen
              match={selectedMatch}
              autoStart
              onBack={() => setView(role === 'comisionado' ? 'start' : 'lineup')}
              onHome={() => setView('home')}
            />
          ) : null
        ) : appRole === null ? (
          <RoleSelectScreen onSelect={setAppRole} />
        ) : (
          <LoginScreen role={appRole} />
        )}

        {/* Modal de instalación sobre el Login (Android: instalador nativo · iOS: instrucciones). */}
        <InstallModal
          open={pwa.needsReminder}
          platform={pwa.platform}
          canPrompt={pwa.canPrompt}
          promptUnavailable={pwa.promptUnavailable}
          promptSupported={pwa.promptSupported}
          unavailableReason={pwa.unavailableReason}
          onInstall={pwa.promptInstall}
          onRetry={pwa.retryPrompt}
          onLater={pwa.dismiss}
        />
      </div>

      {/* Aviso: solo visible en pantallas grandes con puntero fino (escritorio/portátil). */}
      <div className="hidden lg:pointer-fine:block">
        <DesktopNotice />
      </div>

      {/* Diagnóstico PWA: solo con ?pwa=debug. Muestra en pantalla por qué el
          instalador nativo no está disponible (origen, SW, manifest, evento). */}
      <PwaDebugPanel
        platform={pwa.platform}
        canPrompt={pwa.canPrompt}
        promptSeenAt={pwa.promptSeenAt}
        promptSupported={pwa.promptSupported}
        promptUnavailable={pwa.promptUnavailable}
        unavailableReason={pwa.unavailableReason}
        installed={pwa.installed}
      />
    </>
  )
}

