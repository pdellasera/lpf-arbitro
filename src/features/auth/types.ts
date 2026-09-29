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
    role: string
  }
}

export interface AppVersion {
  version: string
}
