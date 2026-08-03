import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/authStore'
import { getRoomsByProperty } from '../api/rooms'
import { getBookingsByProperty } from '../api/bookings'
import { getTasksByProperty } from '../api/task'
import { getTicketsByProperty } from '../api/tickets'
import type { RoomStatus } from '../types/room'

interface Stats {
  availableRooms: number
  totalRooms: number
  activeBookings: number
  pendingTasks: number
  openTickets: number
  roomStatusCounts: Record<string, number>
}

const ROOM_STATUS_COLORS: Record<string, string> = {
  Available:   'bg-cyan-500',
  Occupied:    'bg-violet-500',
  Cleaning:    'bg-amber-500',
  Maintenance: 'bg-rose-500',
  OutOfOrder:  'bg-slate-500',
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const propertyId = user?.propertyId

  const [stats, setStats] = useState<Stats>({
    availableRooms: 0,
    totalRooms: 0,
    activeBookings: 0,
    pendingTasks: 0,
    openTickets: 0,
    roomStatusCounts: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return

    Promise.all([
      getRoomsByProperty(propertyId, undefined, 1, 100),
      getBookingsByProperty(propertyId, { Status: 'CheckedIn' }, 1, 1),
      getTasksByProperty(propertyId, {Status: 'Pending'}, 1, 1),
      getTicketsByProperty(propertyId, { Status: 'Open' }, 1, 1),
    ]).then(([rooms, bookings, tasks, tickets]) => {
      const statusCounts: Record<string, number> = {}
      rooms.items.forEach((r) => {
        const s = r.status as string
        statusCounts[s] = (statusCounts[s] ?? 0) + 1
      })
      setStats({
        availableRooms: statusCounts['Available'] ?? 0,
        totalRooms: rooms.totalCount,
        activeBookings: bookings.totalCount,
        pendingTasks: tasks.totalCount,
        openTickets: tickets.totalCount,
        roomStatusCounts: statusCounts,
      })
    }).finally(() => setLoading(false))
  }, [propertyId])

  const kpiCards = [
    {
      label: 'Available Rooms',
      value: loading ? '—' : `${stats.availableRooms}`,
      sub: `of ${stats.totalRooms} total`,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    },
    {
      label: 'Active Bookings',
      value: loading ? '—' : `${stats.activeBookings}`,
      sub: 'checked in',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    },
    {
      label: 'Pending Tasks',
      value: loading ? '—' : `${stats.pendingTasks}`,
      sub: 'housekeeping',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    },
    {
      label: 'Open Tickets',
      value: loading ? '—' : `${stats.openTickets}`,
      sub: 'maintenance',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />,
    },
  ]

  const roomStatusRows = Object.entries(ROOM_STATUS_COLORS).map(([status, color]) => ({
    label: status === 'OutOfOrder' ? 'Out of Order' : status,
    count: stats.roomStatusCounts[status] ?? 0,
    pct: stats.totalRooms > 0
      ? Math.round(((stats.roomStatusCounts[status] ?? 0) / stats.totalRooms) * 100)
      : 0,
    color,
  }))

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((s) => (
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-5">Room Status Breakdown</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : (
              <div className="space-y-3">
                {roomStatusRows.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-24 shrink-0">{r.label}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${r.color}`} style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-12 text-right">{r.count} ({r.pct}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Booking',    to: '/bookings',    color: 'bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20' },
                { label: 'Add Task',       to: '/tasks',       color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20' },
                { label: 'Report Ticket',  to: '/maintenance', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' },
                { label: 'Add Guest',      to: '/guests',      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.to}
                  className={`border rounded-xl py-3 px-4 text-sm font-medium transition-colors text-center ${action.color}`}
                >
                  {action.label}
                </a>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Logged in as</p>
              <p className="text-sm text-white font-medium">{user?.firstName} {user?.secondName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user?.role}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
