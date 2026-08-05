import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/Layout'
import type { HousekeepingTask, HouseTaskFilters, TaskStatus } from '../types/task'
import { getTasksByProperty, startTask, completeTask, cancelTask } from '../api/task'
import { useAuthStore } from '../store/authStore'
import { AddTaskModal } from './housekeeping/AddTaskModal'
import { Pagination } from '../components/Pagination'
import { TranslateButton } from '../components/TranslateButton'

const STATUS_TABS: { labelKey: string; value: TaskStatus | 'All' }[] = [
  { labelKey: 'common.all', value: 'All' },
  { labelKey: 'status.pending', value: 'Pending' },
  { labelKey: 'status.inProgress', value: 'InProgress' },
  { labelKey: 'status.completed', value: 'Completed' },
  { labelKey: 'status.cancelled', value: 'Cancelled' },
]

const STATUS_STYLE: Record<TaskStatus, { badge: string; dot: string }> = {
  Pending:    { badge: 'bg-amber-500/10 text-amber-400',   dot: 'bg-amber-400' },
  InProgress: { badge: 'bg-violet-500/10 text-violet-400', dot: 'bg-violet-400' },
  Completed:  { badge: 'bg-cyan-500/10 text-cyan-400',     dot: 'bg-cyan-400' },
  Cancelled:  { badge: 'bg-rose-500/10 text-rose-400',     dot: 'bg-rose-400' },
}

const STATUS_KEY: Record<TaskStatus, string> = {
  Pending:    'status.pending',
  InProgress: 'status.inProgress',
  Completed:  'status.completed',
  Cancelled:  'status.cancelled',
}

const SORT_OPTIONS = [
  { label: 'Scheduled date', value: 'scheduledAt' },
  { label: 'Status',         value: 'status' },
]

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const EMPTY_FILTERS: HouseTaskFilters = {}

export function HousekeepingPage() {
  const { t } = useTranslation()
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
  const [filters, setFilters] = useState<HouseTaskFilters>(EMPTY_FILTERS)

  const hasActiveFilters = !!(filters.ScheduledFrom || filters.ScheduledTo || filters.SortBy)

  const fetchTasks = useCallback(() => {
    if (!propertyId) return
    setLoading(true)
    const apiFilters: HouseTaskFilters = {
      ...filters,
      ...(activeStatus !== 'All' ? { Status: activeStatus as TaskStatus } : {}),
    }
    getTasksByProperty(propertyId, apiFilters, page)
      .then((data) => { setTasks(data.items); setTotalPages(data.totalPages) })
      .finally(() => setLoading(false))
  }, [propertyId, activeStatus, page, filters])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTasks() }, [fetchTasks])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1) }, [filters, activeStatus])

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
      <Layout>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">{t('housekeeping.title')}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{tasks.length} {t('housekeeping.task').toLowerCase()}s</p>
            </div>
            {isManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('housekeeping.addTask')}
              </button>
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
              <label className="text-xs text-slate-500 font-medium">{t('common.from')}</label>
              <input
                type="date"
                value={filters.ScheduledFrom ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, ScheduledFrom: e.target.value || undefined }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">{t('common.to')}</label>
              <input
                type="date"
                value={filters.ScheduledTo ?? ''}
                onChange={(e) => setFilters((f) => ({ ...f, ScheduledTo: e.target.value || undefined }))}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">{t('common.sortBy')}</label>
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

            {filters.SortBy && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 font-medium">{t('common.order')}</label>
                <button
                  onClick={() => setFilters((f) => ({ ...f, SortDescending: !f.SortDescending }))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
                >
                  {filters.SortDescending ? (
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
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden min-w-[550px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('housekeeping.task')}</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('housekeeping.assignedTo')}</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('housekeeping.scheduled')}</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('common.status')}</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">{t('common.actions')}</th>
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
                    <td colSpan={5} className="text-center py-16 text-slate-500 text-sm">{t('housekeeping.empty')}</td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const style = STATUS_STYLE[task.status]
                    return (
                      <tr key={task.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                        <td className="px-5 py-4">
                          <TranslateButton text={task.title} className="text-white font-medium" />
                          <p className="text-xs text-slate-500 mt-0.5">Room {task.roomNumber}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-300">{task.assignedToName ?? '—'}</td>
                        <td className="px-5 py-4 text-slate-300">{fmt(task.scheduledAt)}</td>
                        <td className="px-5 py-4">
                          <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {t(STATUS_KEY[task.status])}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {task.status === 'Pending' && (
                              <button
                                onClick={() => handleStart(task.id)}
                                disabled={actionLoading === task.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                              >
                                {t('housekeeping.start')}
                              </button>
                            )}
                            {task.status === 'InProgress' && (
                              <button
                                onClick={() => handleComplete(task.id)}
                                disabled={actionLoading === task.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                              >
                                {t('housekeeping.complete')}
                              </button>
                            )}
                            {isManager && (task.status === 'Pending' || task.status === 'InProgress') && (
                              <button
                                onClick={() => handleCancel(task.id)}
                                disabled={actionLoading === task.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                              >
                                {t('common.cancel')}
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
          </div>
        </main>
      </Layout>

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
