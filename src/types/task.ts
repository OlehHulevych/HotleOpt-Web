export type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | "Cancelled";

export interface HousekeepingTask  {
    id:string,
    title:string,
    assignedToId:string,
    assignedToName:string,
    assignedById:string,
    assignedByName:string,
    roomId:string,
    roomNumber:string,
    status:TaskStatus,
    scheduledAt:string,
    competedAt:string
}

export interface HouseTaskFilters {
    Status?: TaskStatus,
    ScheduledFrom?: string,
    ScheduledTo?: string,
    SortBy?: string,
    SortDescending?: boolean,
}