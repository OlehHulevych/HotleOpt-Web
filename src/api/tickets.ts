import type {CreateTicketDto, MaintenanceTicket, TicketFilters} from "../types/ticket.ts";
import client from "./client.ts";
import type {PaginatedResult} from "../types/room.ts";

export const getTicketsByProperty = (propertyId:string, filters:TicketFilters, page=1, pageSize=20 ) =>{
    return client.get<{list:PaginatedResult<MaintenanceTicket>}>(`/api/tickets/property/${propertyId}`, {params:{...filters, page, pageSize }}).then(r=>r.data.list)
}

export const createTicket = (dto:CreateTicketDto) => {
    return client.post("/api/tickets", dto).then((r)=>r.data);
}

export const resolveTicket = (id:string) => client.patch(`/api/tickets/resolve/${id}`)
export const closeTicket = (id:string) => client.patch(`/api/tickets/close/${id}`);
export const deleteTicket = (id:string) => client.delete(`/api/tickets/${id}`);
