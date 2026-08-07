export interface UserDto {
  id: string
  firstName: string
  secondName: string
  email: string
  role: string
  tenantId: string
  propertyId?: string
  isBanned: boolean
}
