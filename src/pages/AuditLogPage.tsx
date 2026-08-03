import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import type { AuditLogDto, EntityAction } from '../types/audit'
import { getAuditLogs } from '../api/audit'
import { getUsers } from '../api/users'
import type { UserDto } from '../types/user'

const ACTION_STYLE: Record<EntityAction, string> = {
  Created: 'bg-cyan-500/10 text-cyan-400',
  Updated: 'bg-amber-500/10 text-amber-400',
  Deleted: 'bg-rose-500/10 text-rose-400',
}

function fmt(date: string) {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatChanges(raw: string): string {
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ')
  } catch {
    return raw
  }
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([])
  const [userMap, setUserMap] = useState<Record<string, UserDto>>({})
  const [loading, setLoading] = useState(false)
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState<EntityAction | ''>('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getAuditLogs(), getUsers()])
      .then(([logData, users]) => {
        setLogs(logData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        const map: Record<string, UserDto> = {}
        users.forEach((u) => { map[u.id] = u })
        setUserMap(map)
      })
      .finally(() => setLoading(false))
  }, [])

  const entityNames = useMemo(
    () => [...new Set(logs.map((l) => l.entityName))].sort(),
    [logs],
  )

  const filtered = useMemo(
    () => logs.filter((l) =>
      (!entityFilter || l.entityName === entityFilter) &&
      (!actionFilter || l.action === actionFilter),
    ),
    [logs, entityFilter, actionFilter],
  )

  const hasFilters = !!(entityFilter || actionFilter)

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-white">Audit Log</h1>
            <p className="text-slate-400 text-sm mt-0.5">{filtered.length} entries</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Entity filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium">Entity</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All entities</option>
              {entityNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Action filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as EntityAction | '')}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All actions</option>
              <option value="Created">Created</option>
              <option value="Updated">Updated</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>

          {/* Clear */}
          {hasFilters && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium opacity-0">Clear</label>
              <button
                onClick={() => { setEntityFilter(''); setActionFilter('') }}
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
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">When</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Entity</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Action</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Changed by</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3.5">Changes</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500 text-sm">No audit entries found</td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const user = userMap[log.changedById]
                  const userName = user ? `${user.firstName} ${user.secondName}` : log.changedById.slice(0, 8) + '…'
                  const changesText = formatChanges(log.changes)
                  return (
                    <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{fmt(log.createdAt)}</td>
                      <td className="px-5 py-4">
                        <p className="text-white font-medium">{log.entityName}</p>
                        <p className="text-xs text-slate-500 font-mono">{log.entityId.slice(0, 8)}…</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${ACTION_STYLE[log.action]}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm">{userName}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs max-w-xs">
                        <span className="line-clamp-2">{changesText}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
