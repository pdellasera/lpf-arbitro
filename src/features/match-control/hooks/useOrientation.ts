import { useEffect, useState } from 'react'

export type Orientation = 'portrait' | 'landscape'

function getOrientation(): Orientation {
  if (typeof window === 'undefined') return 'landscape'
  try {
    if (window.matchMedia?.('(orientation: portrait)').matches) return 'portrait'
  } catch {
    /* noop */
  }
  return window.innerWidth < window.innerHeight ? 'portrait' : 'landscape'
}

/** Devuelve la orientación actual y reacciona a cambios. */
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() => getOrientation())

  useEffect(() => {
    const onChange = () => setOrientation(getOrientation())
    let mq: MediaQueryList | null = null
    try {
      mq = window.matchMedia('(orientation: portrait)')
      mq.addEventListener?.('change', onChange)
    } catch {
      /* noop */
    }
    window.addEventListener('resize', onChange)
    window.addEventListener('orientationchange', onChange)
    return () => {
      mq?.removeEventListener?.('change', onChange)
      window.removeEventListener('resize', onChange)
      window.removeEventListener('orientationchange', onChange)
    }
  }, [])

  return orientation
}

/** Intenta bloquear en horizontal (best-effort; solo en algunos navegadores/fullscreen). */
export async function tryLockLandscape(): Promise<boolean> {
  try {
    const orient = screen.orientation as ScreenOrientation & {
      lock?: (o: OrientationLockType) => Promise<void>
    }
    if (orient && typeof orient.lock === 'function') {
      await orient.lock('landscape')
      return true
    }
  } catch {
    /* ignorado */
  }
  return false
}
