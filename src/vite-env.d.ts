/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** '1' = desactiva el service worker de desarrollo (sw-dev.js). */
  readonly VITE_PWA_NO_DEV_SW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
