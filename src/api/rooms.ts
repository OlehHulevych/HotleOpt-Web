import client from './client'
import type {Room, PaginatedResult, RoomStatus, RoomPhoto} from '../types/room'

export const getRooms = (page = 1, pageSize = 20) =>
  client
    .get<{ list: PaginatedResult<Room> }>(`/api/room`, { params: { currentPage: page, pageSize } })
    .then((r) => r.data.list)

export const getRoomsByProperty = (propertyId: string, status?: RoomStatus, page = 1, pageSize = 20) =>
  client
    .get<{ result: PaginatedResult<Room> }>(`/api/room/property/${propertyId}`, {
      params: { status, currentPage: page, pageSize },
    })
    .then((r) => r.data.result)
export const getPhotosByRoom = (roomId:string, page=1, pageSize=20) => client.get<PaginatedResult<RoomPhoto>>(`/api/rooms/${roomId}/photos`, {params:{page,pageSize}}).then(r=>r.data)