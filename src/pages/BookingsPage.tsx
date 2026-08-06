import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/Layout'
import type { Booking, BookingFilters, BookingStatus } from '../types/booking'
import { getBookingsByProperty, checkIn, checkOut, cancelBooking } from '../api/bookings'
import { exportBookings } from '../api/export'
import { useAuthStore } from '../store/authStore'
import { AddBookingModal } from './bookings/AddBookingModal.tsx'
import { InvoiceModal } from './bookings/InvoiceModal.tsx'
import { Pagination } from '../components/Pagination'
import { toast } from 'sonner'

const STATUS_TABS: { labelKey: string; value: BookingStatus | 'All' }[] = [
  { labelKey: 'common.all', value: 'All' },
  { labelKey: 'status.confirmed', value: 'Confirmed' },
  { labelKey: 'status.checkedIn', value: 'CheckedIn' },
  { labelKey: 'status.checkedOut', value: 'CheckedOut' },
  { labelKey: 'status.cancelled', value: 'Cancelled' },
]

const STATUS_STYLE: Record<BookingStatus, string> = {
  Confirmed:  'bg-cyan-500/10 text-cyan-400',
  CheckedIn:  'bg-violet-500/10 text-violet-400',
  CheckedOut: 'bg-slate-500/10 text-slate-400',
  Cancelled:  'bg-rose-500/10 text-rose-400',
}

const STATUS_KEY: Record<BookingStatus, string> = {
  Confirmed:  'status.confirmed',
  CheckedIn:  'status.checkedIn',
  CheckedOut: 'status.checkedOut',
  Cancelled:  'status.cancelled',
}

const SORT_OPTIONS = [
  { label: 'Check-in date',  value: 'checkIn' },
  { label: 'Check-out date', value: 'checkOut' },
  { label: 'Status',         value: 'status' },
]

function nights(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const EMPTY_FILTERS: BookingFilters = {}

export default function BookingsPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isManager = user?.role === 'Manager'
  const propertyId = user?.propertyId

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState<BookingStatus | 'All'>('All')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS)
  const [invoiceBookingId, setInvoiceBookingId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!propertyId) return
    setExporting(true)
    try { await exportBookings(propertyId) } finally { setExporting(false) }
  }

  const hasActiveFilters = !!(filters.checkInFrom || filters.checkInTo || filters.sortBy)

  const fetchBookings = useCallback(() => {
    if (!propertyId) return
    setLoading(true)
    const apiFilters: BookingFilters = {
      ...filters,
      ...(activeStatus !== 'All' ? { status: activeStatus as BookingStatus } : {}),
    }
    setTimeout(()=>{
      getBookingsByProperty(propertyId, apiFilters, page)
          .then((result) => { setBookings(result.items); setTotalPages(result.totalPages) })
          .finally(() => setLoading(false))
    },1000)
  }, [activeStatus, propertyId, page, filters])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings() }, [fetchBookings])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1) }, [filters, activeStatus])

  const handleCheckIn = async (id: string) => {
    try {
      setActionLoading(id)
      await checkIn(id)
      fetchBookings()
      setActionLoading(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Check-in failed')
      setActionLoading(null)
    }
  }

  const handleCheckOut = async (id: string) => {
    try {
      setActionLoading(id)
      await checkOut(id)
      fetchBookings()
      setActionLoading(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Check-out failed')
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      setActionLoading(id)
      await cancelBooking(id)
      fetchBookings()
      setActionLoading(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Cancel failed')
      setActionLoading(null)
    }
  }

  return (
    <>
      <Layout>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">{t('bookings.title')}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{bookings.length} total</p>
            </div>
            {isManager && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {exporting ? 'Exporting…' : 'Export CSV'}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('bookings.newBooking')}
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 mb-4 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeStatus === tab.value ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">{t('bookings.checkIn')} {t('common.from')}</label>
              <input
                type="date"
                value={filters.checkInFrom ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, checkInFrom: e.target.value || undefined }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">{t('bookings.checkIn')} {t('common.to')}</label>
              <input
                type="date"
                value={filters.checkInTo ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, checkInTo: e.target.value || undefined }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">{t('common.sortBy')}</label>
              <select
                value={filters.sortBy ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value || undefined }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Default</option>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {filters.sortBy && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">{t('common.order')}</label>
                <button
                  onClick={() => setFilters((f) => ({ ...f, sortDescending: !f.sortDescending }))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
                >
                  {filters.sortDescending ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      {t('common.desc')}
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                      {t('common.asc')}
                    </>
                  )}
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium opacity-0">{t('common.clear')}</label>
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t('common.clear')}
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden min-w-[600px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('bookings.guests')}</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('bookings.checkIn')}</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('bookings.checkOut')}</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('bookings.nights')}</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('common.status')}</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('common.actions')}</th>
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
                    <td colSpan={6} className="text-center py-16 text-slate-500 text-sm">{t('bookings.empty')}</td>
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
                          {t(STATUS_KEY[b.status])}
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
                              {t('bookings.checkInAction')}
                            </button>
                          )}
                          {b.status === 'CheckedIn' && (
                            <button
                              onClick={() => handleCheckOut(b.id)}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                            >
                              {t('bookings.checkOutAction')}
                            </button>
                          )}
                          {b.status === 'CheckedOut' && (
                            <button
                              onClick={() => setInvoiceBookingId(b.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            >
                              {t('bookings.invoice')}
                            </button>
                          )}
                          {isManager && (b.status === 'Confirmed' || b.status === 'CheckedIn') && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={actionLoading === b.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                            >
                              {t('common.cancel')}
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
          </div>
        </main>
      </Layout>

      <AddBookingModal
        isOpen={showAddModal}
        propertyId={propertyId!}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchBookings}
      />

      <InvoiceModal
        bookingId={invoiceBookingId ?? ''}
        isOpen={invoiceBookingId !== null}
        onClose={() => setInvoiceBookingId(null)}
      />
    </>
  )
}
