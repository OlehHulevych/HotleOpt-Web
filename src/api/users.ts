import client from './client'
import type { UserDto } from '../types/user'

export const getUsers = () =>
  client.get<{ users: UserDto[] }>('/api/users').then((r) => r.data.users)
