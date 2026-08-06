import client from './client'
import type { UserDto } from '../types/user'

export const getUsers = () =>
  client.get<{ users: UserDto[] }>('/api/users').then((r) => r.data.users)

export const updateRole = (id: string, role: string) =>
  client.patch(`/api/users/${id}/role`, { role })

export const banUser = (id: string) =>
  client.delete(`/api/users/${id}`)
