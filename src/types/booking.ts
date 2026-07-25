export type BookingStatus = 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled'

export interface Booking {
  id: string
  roomId: string
  propertyId: string
  checkInDate: string
  checkOutDate: string
  status: BookingStatus
  guestNames: string[]
}

export interface BookingFilters {
  status?: BookingStatus
  checkInFrom?: string
  checkInTo?: string
  sortBy?: string
  sortDescending?: boolean
}
