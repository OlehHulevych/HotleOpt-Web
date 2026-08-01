export type ShiftStatus = 'Scheduled' | 'Active' | 'Completed' | 'Cancelled'

export interface Shift {
    id: string
    startTime: string
    endTime: string
    tenantId: string
    propertyId: string
    staffId: string
    staffName: string
    status: ShiftStatus
}

export interface CreateShiftDto {
    startTime: string
    endTime: string
    propertyId: string
    staffId: string
}