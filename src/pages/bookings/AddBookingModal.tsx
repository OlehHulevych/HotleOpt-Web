import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createBooking } from '../../api/bookings'
import { getRoomsByProperty } from '../../api/rooms'
import { getGuests } from '../../api/guests'
import type { Room } from '../../types/room'
import type { Guest } from '../../types/guest'

interface Props {
  isOpen: boolean
  propertyId: string
  onClose: () => void
  onSuccess: () => void
}

export function AddBookingModal({ isOpen, propertyId, onClose, onSuccess }: Props) {
  const { t } = useTranslation()
  const [rooms, setRooms] = useState<Room[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [roomId, setRoomId] = useState('')
  const [primaryGuestId, setPrimaryGuestId] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    getRoomsByProperty(propertyId).then((r) => setRooms(r.items))
    getGuests().then((r) => setGuests(r.items))
  }, [isOpen, propertyId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createBooking({ roomId, propertyId, primaryGuestId, checkInDate, checkOutDate })
      onSuccess()
      onClose()
    } catch {
      setError('Failed to create booking. Room may already be booked for these dates.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{t('bookings.newBooking')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('bookings.room')}</label>
            <select
              required
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">{t('common.selectRoom')}</option>
              {rooms.filter((r) => r.status === 'Available').map((r) => (
                <option key={r.id} value={r.id}>#{r.roomNumber} — {r.type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('bookings.primaryGuest')}</label>
            <select
              required
              value={primaryGuestId}
              onChange={(e) => setPrimaryGuestId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">{t('guests.selectGuest')}</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>{g.firstName} {g.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('bookings.checkIn')}</label>
              <input
                required
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('bookings.checkOut')}</label>
              <input
                required
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {error && <p className="text-rose-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
              {loading ? t('common.creating') : t('bookings.createBooking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
