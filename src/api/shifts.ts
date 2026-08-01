import client from "./client"
import type {PaginatedResult} from "../types/room.ts";
import type {CreateShiftDto, Shift} from "../types/shift.ts";

export const getShiftsByProperty = (propertyId:string,page=1, pageSize=10) => {
   return client.get<{list:PaginatedResult<Shift>}>(`/api/shift/property/${propertyId}`, {params:{page,pageSize}}).then((r)=>r.data.list);
}

export const createShift= (dto:CreateShiftDto) => {
    return client.post("/api/shift",dto)
}

export const deleteShift = (id:string) => client.delete(`/api/shift/${id}`);