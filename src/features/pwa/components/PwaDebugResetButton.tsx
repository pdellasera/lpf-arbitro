import { useState } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import { clearAppData, isPwaDebug } from '../lib/clearAppData'

/** Botón de depuración (visible en dev o con `?pwa=debug`) que borra SW, cachés
 *  y almacenamiento local y recarga, para desbloquear la instalación. */
export function PwaDebugResetButton() {
  const [busy, setBusy] = useState(false)

  if (!isPwaDebug()) return null

  async function handleReset() {
    if (busy) return
    setBusy(true)
    try {
      const r = await clearAppData()
      console.info(`[pwa] limpieza: ${r.registrations} SW, ${r.caches} cachés, ${r.storageKeys} claves`)
    } finally {
      // Recargar para que el SW nuevo (o ninguno) controle la página y Chrome
      // vuelva a evaluar la instalabilidad desde cero.
      window.location.reload()
    }
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={busy}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-400/30 bg-amber-400/5 px-3 py-2.5 text-[12px] font-medium text-amber-200/90 transition-colors hover:bg-amber-400/10 disabled:cursor-wait disabled:opacity-60"
    >
      {busy ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {busy ? 'Limpiando…' : 'Debug · Borrar caché y reinstalar'}
    </button>
  )
}
