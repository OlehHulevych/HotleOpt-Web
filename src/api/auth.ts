import client from './client'
import type {AuthResponse, LoginRequest, User} from '../types/auth'

export const login = (data: LoginRequest) =>
  client.post<AuthResponse>('/api/auth/login', data).then((r) => r.data.responseDto)

export const getMe = ()=> client.get<User>("/api/auth/me").then((r)=>r.data);