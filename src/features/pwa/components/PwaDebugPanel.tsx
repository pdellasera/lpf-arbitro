import { isDiagnosticsEnabled, usePwaDiagnostics } from '../lib/pwaDiagnostics'
import type { InstallPlatform, UnavailableReason } from '../types'

interface PwaDebugPanelProps {
  platform: InstallPlatform
  canPrompt: boolean
  promptSeenAt: number | null
  promptSupported: boolean
  promptUnavailable: boolean
  unavailableReason: UnavailableReason | null
  installed: boolean
}

function Row({ k, v }: { k: string; v: string | number | boolean | null }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/5 py-0.5">
      <span className="shrink-0 text-white/50">{k}</span>
      <span className="break-all text-right text-emerald-300">{String(v)}</span>
    </div>
  )
}

function Verdict({ reason }: { reason: UnavailableReason | null }) {
  const map: Record<UnavailableReason, string> = {
    insecure: '❌ Contexto NO seguro → abre vía https:// o localhost (port forwarding / túnel)',
    'no-sw': '❌ Sin service worker activo → usa producción (npm run preview) o verifica sw-dev.js',
    unavailable:
      '⚠️ Contexto OK pero Chrome no emite el evento (engagement / cooldown / incógnito / Firefox)',
  }
  if (!reason) return null
  return (
    <div className="mt-2 rounded bg-amber-400/10 px-2 py-1.5 text-[11px] text-amber-200">
      {map[reason]}
    </div>
  )
}

export function PwaDebugPanel(props: PwaDebugPanelProps) {
  const enabled = isDiagnosticsEnabled()
  const d = usePwaDiagnostics(enabled)

  if (!enabled) return null

  return (
    <div className="fixed bottom-2 left-2 z-[60] max-h-[70vh] w-[min(360px,calc(100vw-16px))] overflow-auto rounded-xl border border-white/10 bg-[#001222]/95 p-3 font-mono text-[11px] leading-relaxed text-white shadow-2xl backdrop-blur">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] font-bold text-white">PWA debug</span>
        <span className="text-white/40">{d.displayMode}</span>
      </div>
      <Row k="origin" v={d.origin} />
      <Row k="secure" v={d.isSecureContext} />
      <Row k="platform" v={props.platform} />
      <Row k="sw api" v={d.hasSwApi} />
      <Row k="controller" v={d.controller} />
      <Row k="registrations" v={d.registrations.length} />
      {d.registrations.map((r) => (
        <div key={r.scope} className="pl-2">
          <Row k={`  ${r.state}`} v={r.scriptURL} />
        </div>
      ))}
      <Row
        k="manifest"
        v={d.manifest ? `${d.manifest.status} ${d.manifest.name ?? ''} (${d.manifest.icons} icons)` : '…'}
      />
      <Row
        k="prompt seen"
        v={
          props.promptSeenAt !== null
            ? `sí (${Math.max(0, Math.round((Date.now() - props.promptSeenAt) / 1000))}s)`
            : 'no'
        }
      />
      <Row k="canPrompt" v={props.canPrompt} />
      <Row k="promptSupported" v={props.promptSupported} />
      <Row k="installed" v={props.installed} />
      <Row k="UA" v={d.userAgent} />
      <Verdict reason={props.unavailableReason} />
    </div>
  )
}
