import type { AppVersion, LoginCredentials, LoginResult } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Autentica al usuario. Si VITE_API_URL está definido llama al backend real;
 * en caso contrario usa un mock local para desarrollo.
 */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!res.ok) {
      throw new Error('Credenciales inválidas')
    }
    return (await res.json()) as LoginResult
  }

  // Mock de desarrollo
  await delay(1100)
  const email = credentials.email.trim().toLowerCase()
  if (email !== 'arbitro@lpf.com' || credentials.password !== '123456') {
    throw new Error('Correo o contraseña incorrectos')
  }
  return {
    token: 'mock-token',
    user: { id: '1', name: 'Árbitro LPF', role: 'referee' },
  }
}

export async function fetchAppVersion(): Promise<AppVersion> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/app/version`)
    if (!res.ok) {
      throw new Error('No se pudo obtener la versión')
    }
    return (await res.json()) as AppVersion
  }

  await delay(250)
  return { version: 'v1.0.0' }
}
