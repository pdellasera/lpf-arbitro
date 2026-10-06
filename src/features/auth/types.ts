export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface LoginResult {
  token: string
  user: {
    id: string
    name: string
    role: 'arbitro' | 'comisionado'
  }
}

export interface AppVersion {
  version: string
}
