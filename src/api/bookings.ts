import client from './client'
import type { Booking, BookingFilters } from '../types/booking'
import type { PaginatedResult } from '../types/room'

export const getBookingsByProperty = (propertyId: string, filters?: BookingFilters, page = 1, pageSize = 20) =>
  client
    .get<{ data: PaginatedResult<Booking> }>(`/api/bookings/property/${propertyId}`, {
      params: { ...filters, page, pageSize },
    })
    .then((r) => r.data.data)

export const checkIn = (id: string) =>
  client.post(`/api/bookings/${id}/checkin`)

export const checkOut = (id: string) =>
  client.post(`/api/bookings/${id}/checkout`)

export const cancelBooking = (id: string) =>
  client.post(`/api/bookings/${id}/cancel`)


export const createBooking = (dto:{roomId:string, propertyId:string,primaryGuestId:string,checkInDate:string, checkOutDate:string}) => client.post("/api/bookings", dto).then(r=>r.data);
export const addGuestToBooking = (bookingId:string,guestId:string)=> client.post(`/api/bookings/${bookingId}/guests/${guestId}`).then(r=>r.data);