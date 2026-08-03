import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import type { HousekeepingTask, TaskStatus } from '../types/task'
import { getTasksByProperty, startTask, completeTask, cancelTask } from '../api/task'
import { useAuthStore } from '../store/authStore'
import { AddTaskModal } from './housekeeping/AddTaskModal'
import { Pagination } from '../components/Pagination'

const STATUS_TABS: { label: string; value: TaskStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' },
]

const STATUS_STYLE: Record<TaskStatus, { badge: string; dot: string }> = {
  Pending:    { badge: 'bg-amber-500/10 text-amber-400',  dot: 'bg-amber-400' },
  InProgress: { badge: 'bg-violet-500/10 text-violet-400', dot: 'bg-violet-400' },
  Completed:  { badge: 'bg-cyan-500/10 text-cyan-400',    dot: 'bg-cyan-400' },
  Cancelled:  { badge: 'bg-rose-500/10 text-rose-400',    dot: 'bg-rose-400' },
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  Pending:    'Pending',
  InProgress: 'In Progress',
  Completed:  'Completed',
  Cancelled:  'Cancelled',
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function HousekeepingPage() {
  const user = useAuthStore((s) => s.user)
  const isManager = user?.role === 'Manager'
  const propertyId = user?.propertyId

  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [loading, setLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState<TaskStatus | 'All'>('All')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTasks = useCallback(() => {
    if (!propertyId) return
    setLoading(true)
    const filters = activeStatus !== 'All' ? { Status: activeStatus as TaskStatus } : undefined
    getTasksByProperty(propertyId, filters, page)
      .then((data) => { setTasks(data.items); setTotalPages(data.totalPages) })
      .finally(() => setLoading(false))
  }, [propertyId, activeStatus, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks()
  }, [fetchTasks])

  const handleStart = async (id: string) => {
    setActionLoading(id)
    await startTask(id)
    fetchTasks()
    setActionLoading(null)
  }

  const handleComplete = async (id: string) => {
    setActionLoading(id)
    await completeTask(id)
    fetchTasks()
    setActionLoading(null)
  }

  const handleCancel = async (id: string) => {
    setActionLoading(id)
    await cancelTask(id)
    fetchTasks()
    setActionLoading(null)
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#0F172A]">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">Housekeeping</h1>
              <p className="text-slate-400 text-sm mt-0.5">{tasks.length} tasks</p>
            </div>
            {isManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            )}
          </div>

          <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit mb-6">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setActiveStatus(tab.value); setPage(1) }}
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
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Task</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Assigned To</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Scheduled</th>
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
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-500 text-sm">No tasks found</td>
                  </tr>
                ) : (
                  tasks.map((t) => {
                    const style = STATUS_STYLE[t.status]
                    return (
                      <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-white font-medium">{t.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Room {t.roomNumber}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-300">{t.assignedToName ?? '—'}</td>
                        <td className="px-5 py-4 text-slate-300">{fmt(t.scheduledAt)}</td>
                        <td className="px-5 py-4">
                          <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {STATUS_LABEL[t.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {t.status === 'Pending' && (
                              <button
                                onClick={() => handleStart(t.id)}
                                disabled={actionLoading === t.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                              >
                                Start
                              </button>
                            )}
                            {t.status === 'InProgress' && (
                              <button
                                onClick={() => handleComplete(t.id)}
                                disabled={actionLoading === t.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                              >
                                Complete
                              </button>
                            )}
                            {isManager && (t.status === 'Pending' || t.status === 'InProgress') && (
                              <button
                                onClick={() => handleCancel(t.id)}
                                disabled={actionLoading === t.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </main>
      </div>

      {isManager && propertyId && (
        <AddTaskModal
          isOpen={showAddModal}
          propertyId={propertyId}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchTasks}
        />
      )}
    </>
  )
}
