import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import type { MaintenanceTicket, TicketFilters, TicketStatus, TicketPriority } from '../types/ticket'
import { getTicketsByProperty, resolveTicket, closeTicket, deleteTicket } from '../api/tickets'
import { useAuthStore } from '../store/authStore'
import { AddTicketModal } from './maintenance/AddTicketModal'
import { Pagination } from '../components/Pagination'
import { TranslateButton } from '../components/TranslateButton'

const STATUS_TABS: { label: string; value: TicketStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Closed', value: 'Closed' },
]

const STATUS_STYLE: Record<TicketStatus, { badge: string; dot: string }> = {
  Open:       { badge: 'bg-amber-500/10 text-amber-400',   dot: 'bg-amber-400' },
  InProgress: { badge: 'bg-violet-500/10 text-violet-400', dot: 'bg-violet-400' },
  Resolved:   { badge: 'bg-cyan-500/10 text-cyan-400',     dot: 'bg-cyan-400' },
  Closed:     { badge: 'bg-slate-500/10 text-slate-400',   dot: 'bg-slate-400' },
}

const STATUS_LABEL: Record<TicketStatus, string> = {
  Open:       'Open',
  InProgress: 'In Progress',
  Resolved:   'Resolved',
  Closed:     'Closed',
}

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  Low:      'bg-slate-500/10 text-slate-400',
  Medium:   'bg-amber-500/10 text-amber-400',
  High:     'bg-orange-500/10 text-orange-400',
  Critical: 'bg-rose-500/10 text-rose-400',
}

const PRIORITY_ACTIVE: Record<TicketPriority, string> = {
  Low:      'bg-slate-500/30 text-slate-200 border-slate-400',
  Medium:   'bg-amber-500/30 text-amber-200 border-amber-400',
  High:     'bg-orange-500/30 text-orange-200 border-orange-400',
  Critical: 'bg-rose-500/30 text-rose-200 border-rose-400',
}

const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical']

const SORT_OPTIONS = [
  { label: 'Created date', value: 'createdAt' },
  { label: 'Priority',     value: 'priority' },
  { label: 'Status',       value: 'status' },
]

const EMPTY_FILTERS: TicketFilters = {}

export function MaintenancePage() {
  const user = useAuthStore((s) => s.user)
  const isManager = user?.role === 'Manager'
  const propertyId = user?.propertyId

  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState<TicketStatus | 'All'>('All')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<TicketFilters>(EMPTY_FILTERS)

  const hasActiveFilters = !!(filters.Priority || filters.CreatedFrom || filters.CreatedTo || filters.SortBy)

  const fetchTickets = useCallback(() => {
    if (!propertyId) return
    setLoading(true)
    const apiFilters: TicketFilters = {
      ...filters,
      ...(activeStatus !== 'All' ? { Status: activeStatus as TicketStatus } : {}),
    }
    getTicketsByProperty(propertyId, apiFilters, page)
      .then((data) => { setTickets(data.items); setTotalPages(data.totalPages) })
      .finally(() => setLoading(false))
  }, [propertyId, activeStatus, page, filters])

  useEffect(() => { fetchTickets() }, [fetchTickets])
  useEffect(() => { setPage(1) }, [filters, activeStatus])

  const handleResolve = async (id: string) => {
    setActionLoading(id)
    await resolveTicket(id)
    fetchTickets()
    setActionLoading(null)
  }

  const handleClose = async (id: string) => {
    setActionLoading(id)
    await closeTicket(id)
    fetchTickets()
    setActionLoading(null)
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    await deleteTicket(id)
    setConfirmDelete(null)
    fetchTickets()
    setActionLoading(null)
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#0F172A]">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">Maintenance</h1>
              <p className="text-slate-400 text-sm mt-0.5">{tickets.length} tickets</p>
            </div>
            {isManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Ticket
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit mb-4">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeStatus === tab.value ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Priority toggle buttons */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Priority</label>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, Priority: f.Priority === p ? undefined : p }))}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filters.Priority === p
                        ? PRIORITY_ACTIVE[p]
                        : `${PRIORITY_STYLE[p]} border-transparent hover:border-current`
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Created from */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">From</label>
              <input
                type="date"
                value={filters.CreatedFrom ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, CreatedFrom: e.target.value || undefined }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>

            {/* Created to */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">To</label>
              <input
                type="date"
                value={filters.CreatedTo ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, CreatedTo: e.target.value || undefined }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>

            {/* Sort by */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Sort by</label>
              <select
                value={filters.SortBy ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, SortBy: e.target.value || undefined }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Default</option>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Asc / Desc toggle */}
            {filters.SortBy && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">Order</label>
                <button
                  onClick={() => setFilters((f) => ({ ...f, SortDescending: !f.SortDescending }))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
                >
                  {filters.SortDescending ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Desc
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                      Asc
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Clear */}
            {hasActiveFilters && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium opacity-0">Clear</label>
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Ticket</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Assigned To</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Priority</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Status</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <svg className="animate-spin w-6 h-6 text-cyan-500 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-500 text-sm">No tickets found</td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-4">
                        <TranslateButton text={t.title} className="text-white font-medium" />
                        <p className="text-xs text-slate-500 mt-0.5">Room #{t.roomNumber} · {t.description}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{t.staffName}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${PRIORITY_STYLE[t.priority]}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[t.status].badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[t.status].dot}`} />
                          {STATUS_LABEL[t.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {(t.status === 'Open' || t.status === 'InProgress') && (
                            <button
                              onClick={() => handleResolve(t.id)}
                              disabled={actionLoading === t.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          )}
                          {isManager && t.status === 'Resolved' && (
                            <button
                              onClick={() => handleClose(t.id)}
                              disabled={actionLoading === t.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-colors disabled:opacity-50"
                            >
                              Close
                            </button>
                          )}
                          {isManager && (
                            <button
                              onClick={() => setConfirmDelete(t.id)}
                              disabled={actionLoading === t.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                            >
                              Delete
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

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-white font-semibold mb-2">Delete Ticket</h2>
            <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete this ticket? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={actionLoading === confirmDelete}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {actionLoading === confirmDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isManager && propertyId && (
        <AddTicketModal
          isOpen={showAddModal}
          propertyId={propertyId}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchTickets}
        />
      )}
    </>
  )
}
