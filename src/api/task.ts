import type {HousekeepingTask, HouseTaskFilters} from "../types/task.ts";
import client from "./client.ts";
import type {PaginatedResult} from "../types/room.ts";

export const getTasksByProperty = (propertyId: string, filters?: {
    Status: "Pending" | "InProgress" | "Completed" | "Cancelled"
} | undefined, page = 1, pageSize = 20) => {
    return client.get<{ list: PaginatedResult<HousekeepingTask> }>(`/api/task/property/${propertyId}`, {params:{...filters, currentPage:page,pageSize}}).then((r)=>r.data.list)

}

export const createTask = (dto:{title:string, assignedToId:string,roomId:string, scheduledAt:string,propertyId:string}) => {
    return client.post("/api/task", dto).then(r=>r.data);
}

export const startTask = (id:string) => client.patch(`/api/task/start/${id}`).then((r)=>r.data);
export const completeTask = (id:string) => client.patch(`/api/task/complete/${id}`).then((r)=>r.data);
export const cancelTask = (id:string) => client.patch(`/api/task/cancel/${id}`).then((r)=>r.data);
export const reassign = (id:string, staffId:string) => client.patch(`/api/task/reassign/${id}?staffId=${staffId}`);
