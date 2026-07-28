import client from './client'
import type {Room, PaginatedResult, RoomStatus, RoomPhoto, RoomType} from '../types/room'
import imageCompression from "browser-image-compression";

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
export const addRoom = (dto:{roomNumber:string, description:string, propertyId:string, type:RoomType, pricePerNight:number }) => client.post('api/room/', dto).then(r=>r.data);
export const uploadPhoto = async (roomId:string, file:File) =>{
    const form = new FormData();
    const options  = {
        maxSizeMb:1,
        maxWidthOrHeight:1920,
        useWebHooker:true
    };

    const compressedFile = await imageCompression(file,options);
    form.append('file', compressedFile)
    return client.post(`/api/rooms/${roomId}/photos`, form);
}