import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/Layout'
import type { StaffFairnessDto } from '../types/fairness'
import { getStaffFairness } from '../api/fairness'

const OVERLOAD_THRESHOLD = 25

function initials(name: string) {
  return name?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function FairnessPage() {
  const { t } = useTranslation()
  const [staff, setStaff] = useState<StaffFairnessDto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getStaffFairness()
      .then(setStaff)
      .finally(() => setLoading(false))
  }, [])

  const overloadedCount = staff.filter((s) => s.isOverloaded).length
  const totalTasks = staff.reduce((sum, s) => sum + s.weeklyTaskCount, 0)
  const avgTasks = staff.length ? Math.round(totalTasks / staff.length) : 0

  return (
    <Layout>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">{t('fairness.title')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{t('fairness.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">{t('fairness.totalStaff')}</p>
            <p className="text-3xl font-semibold text-white">{staff.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">{t('fairness.avgTasks')}</p>
            <p className="text-3xl font-semibold text-white">{avgTasks}</p>
          </div>
          <div className={`border rounded-2xl p-5 ${overloadedCount > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
            <p className={`text-xs uppercase tracking-wide font-medium mb-1 ${overloadedCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{t('fairness.overloaded')}</p>
            <p className={`text-3xl font-semibold ${overloadedCount > 0 ? 'text-rose-400' : 'text-white'}`}>{overloadedCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm">{t('fairness.empty')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff
              .sort((a, b) => b.weeklyTaskCount - a.weeklyTaskCount)
              .map((s) => {
                const pct = Math.min((s.weeklyTaskCount / OVERLOAD_THRESHOLD) * 100, 100)
                return (
                  <div
                    key={s.staffId}
                    className={`bg-slate-800/50 border rounded-2xl p-5 transition-colors ${
                      s.isOverloaded ? 'border-rose-500/40' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                        s.isOverloaded ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {initials(s.staffName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{s.staffName}</p>
                        <p className="text-xs text-slate-500">{t('shifts.staff')}</p>
                      </div>
                      {s.isOverloaded && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {t('fairness.overloaded')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-end justify-between mb-2">
                      <span className="text-xs text-slate-500">{t('fairness.tasksThisWeek')}</span>
                      <span className={`text-lg font-semibold ${s.isOverloaded ? 'text-rose-400' : 'text-white'}`}>
                        {s.weeklyTaskCount}
                        <span className="text-xs text-slate-500 font-normal"> / {OVERLOAD_THRESHOLD}</span>
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${s.isOverloaded ? 'bg-rose-500' : 'bg-cyan-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </main>
    </Layout>
  )
}
