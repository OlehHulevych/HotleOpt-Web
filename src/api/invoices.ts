import client from './client'
import type { InvoiceDto } from '../types/invoice'

export const getInvoiceByBooking = (bookingId: string) =>
  client.get<{ invoice: InvoiceDto }>(`/api/invoices/booking/${bookingId}`).then((r) => r.data.invoice)
