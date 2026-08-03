import {useState, useEffect, useCallback} from 'react'
import Sidebar from '../components/Sidebar'
import type { Booking, BookingStatus } from '../types/booking'
import { getBookingsByProperty, checkIn, checkOut, cancelBooking } from '../api/bookings'
import { useAuthStore } from '../store/authStore'
import {AddBookingModal} from "./bookings/AddBookingModal.tsx";
import { Pagination } from '../components/Pagination'
import {toast} from "sonner";



const STATUS_TABS: { label: string; value: BookingStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Checked In', value: 'CheckedIn' },
  { label: 'Checked Out', value: 'CheckedOut' },
  { label: 'Cancelled', value: 'Cancelled' },
]

const STATUS_STYLE: Record<BookingStatus, string> = {
  Confirmed:  'bg-cyan-500/10 text-cyan-400',
  CheckedIn:  'bg-violet-500/10 text-violet-400',
  CheckedOut: 'bg-slate-500/10 text-slate-400',
  Cancelled:  'bg-rose-500/10 text-rose-400',
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  Confirmed:  'Confirmed',
  CheckedIn:  'Checked In',
  CheckedOut: 'Checked Out',
  Cancelled:  'Cancelled',
}

function nights(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BookingsPage() {
  const user = useAuthStore((s) => s.user)
  const isManager = user?.role === 'Manager'
  const propertyId = user?.propertyId;
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState<BookingStatus | 'All'>('All')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchBookings = useCallback(() => {
    if (!propertyId) return
    setLoading(true)
    const filters = activeStatus !== 'All' ? { status: activeStatus } : undefined
    getBookingsByProperty(propertyId, filters, page)
      .then((result) => { setBookings(result.items); setTotalPages(result.totalPages) })
      .finally(() => setLoading(false))
  },[activeStatus, propertyId, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings()
  }, [fetchBookings])

  const handleCheckIn = async (id: string) => {
    try{
      setActionLoading(id)
      await checkIn(id)
      fetchBookings()
      setActionLoading(null)
    }

    catch(error:any){
      toast.error(error?.response?.data?.message ?? "Check-in failed")
    }

  }

  const handleCheckOut = async (id: string) => {
    try{
      setActionLoading(id)
      await checkOut(id)
      fetchBookings()
      setActionLoading(null)
    }
    catch (error:any){
      toast.error(error?.response?.data?.message ?? "Check-out failed")
    }

  }

  const handleCancel = async (id: string) => {
    try {
      setActionLoading(id)
      await cancelBooking(id)
      fetchBookings()
      setActionLoading(null)
    }
    catch (error:any){
      toast.error(error?.response?.data?.message ?? "Cancel failed");
    }

  }

  return (
      <>
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">Bookings</h1>
            <p className="text-slate-400 text-sm mt-0.5">{bookings.length} total</p>
          </div>
          <div className="flex items-center gap-3">

              {isManager && (<button onClick={()=>setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Booking
          </button>)}
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit mb-6">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveStatus(tab.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeStatus === tab.value
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Guests</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Check-in</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Check-out</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Nights</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <svg className="animate-spin w-6 h-6 text-cyan-500 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-500 text-sm">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-white font-medium">
                        {b.guestNames.length > 0 ? b.guestNames.join(', ') : '—'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-mono">{b.roomNumber}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{fmt(b.checkInDate)}</td>
                    <td className="px-5 py-4 text-slate-300">{fmt(b.checkOutDate)}</td>
                    <td className="px-5 py-4 text-slate-300">{nights(b.checkInDate, b.checkOutDate)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[b.status]}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => handleCheckIn(b.id)}
                            disabled={actionLoading === b.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                          >
                            Check In
                          </button>
                        )}
                        {b.status === 'CheckedIn' && (
                          <button
                            onClick={() => handleCheckOut(b.id)}
                            disabled={actionLoading === b.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                          >
                            Check Out
                          </button>
                        )}
                        {isManager && (b.status === 'Confirmed' || b.status === 'CheckedIn') && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            disabled={actionLoading === b.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </main>
    </div>
          <AddBookingModal isOpen={showAddModal} propertyId={propertyId!} onClose={()=>setShowAddModal(false)} onSuccess={fetchBookings}/>
      </>
  )
}
