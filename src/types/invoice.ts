export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Cancelled'

export interface InvoiceDto {
  id: string
  bookingId: string
  roomId: string
  guestName: string
  checkInDate: string
  checkOutDate: string
  nights: number
  pricePerNight: number
  totalAmount: number
  issuedAt: string
  status: InvoiceStatus
}
