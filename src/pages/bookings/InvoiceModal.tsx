import { useEffect, useState } from 'react'
import type { InvoiceDto, InvoiceStatus } from '../../types/invoice'
import { getInvoiceByBooking } from '../../api/invoices'

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  Draft:     'bg-slate-500/10 text-slate-400',
  Issued:    'bg-cyan-500/10 text-cyan-400',
  Paid:      'bg-emerald-500/10 text-emerald-400',
  Cancelled: 'bg-rose-500/10 text-rose-400',
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtCurrency(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })
}

interface Props {
  bookingId: string
  isOpen: boolean
  onClose: () => void
}

export function InvoiceModal({ bookingId, isOpen, onClose }: Props) {
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setError(null)
    setInvoice(null)
    getInvoiceByBooking(bookingId)
      .then(setInvoice)
      .catch(() => setError('Invoice not found for this booking.'))
      .finally(() => setLoading(false))
  }, [isOpen, bookingId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-semibold">Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : error ? (
            <p className="text-center text-rose-400 text-sm py-10">{error}</p>
          ) : invoice ? (
            <>
              {/* Status + issued date */}
              <div className="flex items-center justify-between mb-6">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[invoice.status]}`}>
                  {invoice.status}
                </span>
                <span className="text-xs text-slate-500">Issued {fmt(invoice.issuedAt)}</span>
              </div>

              {/* Guest */}
              <div className="mb-5">
                <p className="text-xs text-slate-500 mb-0.5">Guest</p>
                <p className="text-white font-medium">{invoice.guestName}</p>
              </div>

              {/* Stay details */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Check-in</p>
                  <p className="text-slate-300 text-sm">{fmt(invoice.checkInDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Check-out</p>
                  <p className="text-slate-300 text-sm">{fmt(invoice.checkOutDate)}</p>
                </div>
              </div>

              {/* Line items */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Nights</span>
                  <span className="text-white">{invoice.nights}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Price per night</span>
                  <span className="text-white">{fmtCurrency(invoice.pricePerNight)}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-cyan-400 font-semibold text-base">{fmtCurrency(invoice.totalAmount)}</span>
                </div>
              </div>

              {/* Invoice ID */}
              <p className="text-xs text-slate-600 text-center font-mono">#{invoice.id.slice(0, 8).toUpperCase()}</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
