import client from "./client.ts";
import type {PaginatedResult} from "../types/room.ts";
import type {Guest} from "../types/guest.ts";

export const getGuests = (page=1, pageSize=20) => client.get<{list:PaginatedResult<Guest>}>("/api/guests",{params:{currentPage:page, pageSize }}).then(r=>r.data.list);
export const addGuest = (dto:{firstName:string, lastName:string, email:string,phone:string,  passportNumber:string}) => client.post("/api/guests", dto).then(r=>r.data);
export const updateGuest = (dto:{id:string,firstName:string, lastName:string,email:string, phone:string})=>client.put("/api/guests", dto).then(r=>r.data);
export const deleteGuest = (id:string)=>client.delete(`/api/guests/${id}`).then(r=>r.data);