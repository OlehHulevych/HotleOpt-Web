import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import type { Shift, ShiftStatus } from '../types/shift'
import { getShiftsByProperty, deleteShift } from '../api/shifts'
import { useAuthStore } from '../store/authStore'
import { AddShiftModal } from './shifts/AddShiftModal'

const STATUS_TABS: { label: string; value: ShiftStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Active', value: 'Active' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
]

const STATUS_STYLE: Record<ShiftStatus, { badge: string; dot: string }> = {
  Scheduled: { badge: 'bg-amber-500/10 text-amber-400',   dot: 'bg-amber-400' },
  Active:    { badge: 'bg-cyan-500/10 text-cyan-400',     dot: 'bg-cyan-400' },
  Completed: { badge: 'bg-slate-500/10 text-slate-400',   dot: 'bg-slate-400' },
  Cancelled: { badge: 'bg-rose-500/10 text-rose-400',     dot: 'bg-rose-400' },
}

function fmt(date: string) {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function duration(start: string, end: string) {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60 / 60
  return `${diff.toFixed(1)}h`
}

export function ShiftsPage() {
  const user = useAuthStore((s) => s.user)
  const isManager = user?.role === 'Manager'
  const propertyId = user?.propertyId

  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState<ShiftStatus | 'All'>('All')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchShifts = useCallback(() => {
    if (!propertyId) return
    setLoading(true)
    getShiftsByProperty(propertyId)
      .then((data) => {
        const filtered = activeStatus === 'All'
          ? data.items
          : data.items.filter((s) => s.status === activeStatus)
        setShifts(filtered)
      })
      .finally(() => setLoading(false))
  }, [propertyId, activeStatus])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    await deleteShift(id)
    setConfirmDelete(null)
    fetchShifts()
    setActionLoading(null)
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#0F172A]">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">Shifts</h1>
              <p className="text-slate-400 text-sm mt-0.5">{shifts.length} shifts</p>
            </div>
            {isManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Shift
              </button>
            )}
          </div>

          <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit mb-6">
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

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Staff</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Start</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">End</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Duration</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Status</th>
                  {isManager && <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Actions</th>}
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
                ) : shifts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-500 text-sm">No shifts found</td>
                  </tr>
                ) : (
                  shifts.map((s) => (
                    <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-4 text-white font-medium">{s.staffName}</td>
                      <td className="px-5 py-4 text-slate-300">{fmt(s.startTime)}</td>
                      <td className="px-5 py-4 text-slate-300">{fmt(s.endTime)}</td>
                      <td className="px-5 py-4 text-slate-400">{duration(s.startTime, s.endTime)}</td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[s.status].badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[s.status].dot}`} />
                          {s.status}
                        </span>
                      </td>
                      {isManager && (
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => setConfirmDelete(s.id)}
                              disabled={actionLoading === s.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-white font-semibold mb-2">Delete Shift</h2>
            <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete this shift? This cannot be undone.</p>
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
        <AddShiftModal
          isOpen={showAddModal}
          propertyId={propertyId}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchShifts}
        />
      )}
    </>
  )
}
