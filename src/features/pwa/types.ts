export type InstallPlatform = 'ios' | 'android' | 'other'

/** Evento `beforeinstallprompt` (Chromium); no está tipado en lib.dom. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt: () => Promise<void>
}

export type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

/** Motivo por el que el instalador nativo no está disponible (solo Android). */
export type UnavailableReason = 'insecure' | 'no-sw' | 'unavailable'
