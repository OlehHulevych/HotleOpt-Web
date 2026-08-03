export type RoomType = 'Single' | 'Double' | 'Twin' | 'Suite' | 'Deluxe'

export interface TaskTemplateItemDto {
  id: string
  title: string
  order: number
}

export interface TaskTemplateDto {
  id: string
  name: string
  roomType: RoomType
  propertyId: string
  items: TaskTemplateItemDto[]
}

export interface CreateTaskTemplateDto {
  name: string
  roomType: RoomType
  propertyId: string
  items: { title: string; order: number }[]
}

export interface ApplyTemplateDto {
  roomId: string
  assignedToId: string
  scheduledAt: string
}
