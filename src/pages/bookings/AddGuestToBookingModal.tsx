import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getGuests } from '../../api/guests'
import { addGuestToBooking } from '../../api/bookings'
import type { Guest } from '../../types/guest'

interface Props {
  bookingId: string | null
  onClose: () => void
  onSuccess: () => void
}

export function AddGuestToBookingModal({ bookingId, onClose, onSuccess }: Props) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) return
    setLoading(true)
    getGuests(1, 100)
      .then((r) => setGuests(r.items))
      .finally(() => setLoading(false))
  }, [bookingId])

  if (!bookingId) return null

  const filtered = guests.filter((g) =>
    `${g.firstName} ${g.lastName} ${g.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (guestId: string, name: string) => {
    setAddingId(guestId)
    try {
      await addGuestToBooking(bookingId, guestId)
      toast.success(`${name} added to booking`)
      onSuccess()
    } catch {
      toast.error('Failed to add guest')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <h2 className="text-white font-semibold">Add Guest to Booking</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9 pr-4 py-2 w-full bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-sm">No guests found</p>
            ) : (
              filtered.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                  <div>
                    <p className="text-sm text-white font-medium">{g.firstName} {g.lastName}</p>
                    <p className="text-xs text-slate-500">{g.email}</p>
                  </div>
                  <button
                    disabled={addingId === g.id}
                    onClick={() => handleAdd(g.id, `${g.firstName} ${g.lastName}`)}
                    className="px-3 py-1.5 text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {addingId === g.id ? 'Adding…' : 'Add'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
