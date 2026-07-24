import client from './client'
import type { AuthResponse, LoginRequest } from '../types/auth'

export const login = (data: LoginRequest) =>
  client.post<AuthResponse>('/api/auth/login', data).then((r) => r.data.responseDto)
