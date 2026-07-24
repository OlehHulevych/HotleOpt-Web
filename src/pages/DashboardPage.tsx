import Sidebar from '../components/Sidebar'

const stats = [
  {
    label: 'Available Rooms',
    value: '—',
    sub: 'of total',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
  },
  {
    label: 'Active Bookings',
    value: '—',
    sub: 'checked in',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
  },
  {
    label: 'Pending Tasks',
    value: '—',
    sub: 'housekeeping',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
  {
    label: 'Open Tickets',
    value: '—',
    sub: 'maintenance',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    ),
  },
]

const recentActivity = [
  { type: 'booking', text: 'Room 101 checked in', time: '5 min ago', color: 'bg-violet-500' },
  { type: 'task', text: 'Room 204 cleaning completed', time: '18 min ago', color: 'bg-cyan-500' },
  { type: 'ticket', text: 'AC issue reported in Room 312', time: '42 min ago', color: 'bg-rose-500' },
  { type: 'task', text: 'Room 108 cleaning started', time: '1 hr ago', color: 'bg-cyan-500' },
  { type: 'booking', text: 'Room 215 checked out', time: '2 hr ago', color: 'bg-violet-500' },
]

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {s.icon}
                  </svg>
                </div>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-300 text-sm font-medium mt-0.5">{s.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Recent Activity */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">{item.text}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Booking', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20' },
                { label: 'Add Task', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20' },
                { label: 'Report Ticket', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' },
                { label: 'Add Guest', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' },
              ].map((action) => (
                <button
                  key={action.label}
                  className={`border rounded-xl py-3 px-4 text-sm font-medium transition-colors ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-700">
              <h3 className="text-xs text-slate-500 uppercase tracking-wide mb-3">Room Status</h3>
              <div className="space-y-2">
                {[
                  { label: 'Available', pct: 60, color: 'bg-cyan-500' },
                  { label: 'Occupied', pct: 30, color: 'bg-violet-500' },
                  { label: 'Cleaning', pct: 7, color: 'bg-amber-500' },
                  { label: 'Maintenance', pct: 3, color: 'bg-rose-500' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-24 shrink-0">{r.label}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
