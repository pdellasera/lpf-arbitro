import { useState } from 'react'
import { DesktopNotice } from '@/features/auth/components/DesktopNotice'
import { LoginScreen } from '@/features/auth/components/LoginScreen'
import { useSession } from '@/features/auth/SessionProvider'
import { HomeScreen } from '@/features/matches/components/HomeScreen'
import { LiveMatchScreen } from '@/features/match-control/components/LiveMatchScreen'
import { InstallModal } from '@/features/pwa/components/InstallModal'
import { PwaDebugPanel } from '@/features/pwa/components/PwaDebugPanel'
import { usePwaInstall } from '@/features/pwa/hooks/usePwaInstall'
import type { Match } from '@/features/matches/types'

export default function App() {
  const { session } = useSession()
  const [view, setView] = useState<'home' | 'match'>('home')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const pwa = usePwaInstall()

  return (
    <>
      {/* App: solo móvil y tablet (táctil). Oculto en pantallas grandes con puntero fino. */}
      <div className="lg:pointer-fine:hidden">
        {session ? (
          view === 'home' ? (
            <HomeScreen
              onOpenMatch={(match) => {
                setSelectedMatch(match)
                setView('match')
              }}
            />
          ) : selectedMatch ? (
            <LiveMatchScreen match={selectedMatch} onBack={() => setView('home')} />
          ) : null
        ) : (
          <LoginScreen />
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

