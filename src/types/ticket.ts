export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed'
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface MaintenanceTicket {
    id: string
    title: string
    description: string
    staffId: string
    staffName: string
    reportedId: string
    reportedName: string
    roomId: string
    roomNumber: string
    propertyId: string
    priority: TicketPriority
    status: TicketStatus
    resolvedAt: string | null
}

export interface TicketFilters {
    Status?: TicketStatus
    Priority?: TicketPriority
    CreatedFrom?: string
    CreatedTo?: string
    SortBy?: string
    SortDescending?: boolean
}

export interface CreateTicketDto {
    title: string
    description: string
    staffId: string
    reportedId: string
    priority: TicketPriority
    roomId: string
    propertyId: string
}