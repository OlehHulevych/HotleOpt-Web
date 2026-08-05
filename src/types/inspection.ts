export interface RoomInspection {
  id: string
  roomId: string
  propertyId: string
  photoUrl: string
  passed: boolean
  issues: string | null
  inspectedById: string
  inspectedAt: string
}

export interface InspectionResult {
  passed: boolean
  issues: string | null
}
