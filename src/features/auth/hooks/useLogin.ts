import { useMutation } from '@tanstack/react-query'
import { login } from '../api/authApi'
import type { LoginCredentials } from '../types'

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
  })
}
