import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Layout } from '../components/Layout'
import { getUsers, updateRole, banUser, unbanUser } from '../api/users'
import { useAuthStore } from '../store/authStore'
import type { UserDto } from '../types/user'
import { AddStaffModal } from './staff/AddStaffModal'

const ROLES = ['Staff', 'Manager', 'Owner']

const ROLE_STYLE: Record<string, string> = {
  Owner:   'bg-amber-500/10 text-amber-400',
  Manager: 'bg-violet-500/10 text-violet-400',
  Staff:   'bg-cyan-500/10 text-cyan-400',
}

function StaffPage() {
  const me = useAuthStore((s) => s.user)
  const [staff, setStaff] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchStaff = useCallback(() => {
    if (!me?.propertyId) return
    setLoading(true)
    getUsers()
      .then((all) => setStaff(all.filter((u) => u.propertyId === me.propertyId)))
      .finally(() => setLoading(false))
  }, [me?.propertyId])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStaff() }, [fetchStaff])

  const handleRoleChange = async (id: string, role: string) => {
    setUpdatingId(id)
    try {
      await updateRole(id, role)
      toast.success('Role updated')
      fetchStaff()
    } catch {
      toast.error('Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBan = async (id: string, name: string) => {
    if (!confirm(`Ban ${name}? They will not be able to log in.`)) return
    setUpdatingId(id)
    try {
      await banUser(id)
      toast.success(`${name} has been banned`)
      fetchStaff()
    } catch {
      toast.error('Failed to ban user')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleUnban = async (id: string, name: string) => {
    setUpdatingId(id)
    try {
      await unbanUser(id)
      toast.success(`${name} has been unbanned`)
      fetchStaff()
    } catch {
      toast.error('Failed to unban user')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
      <><Layout>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">Staff Management</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manage roles and access for your team</p>
            </div>
            <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add Staff
            </button>
          </div>

          {loading ? (
              <div className="flex items-center justify-center h-64">
                <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
          ) : staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p className="text-sm">No staff found</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden min-w-[600px]">
                  <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Current
                        Role
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Change
                        Role
                      </th>
                      <th className="px-5 py-3"/>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                    {staff.map((s) => {
                      const isMe = s.id === me?.id
                      const busy = updatingId === s.id
                      return (
                          <tr key={s.id} className={`hover:bg-slate-700/20 transition-colors ${s.isBanned ? 'opacity-60' : ''}`}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 font-medium shrink-0">
                                  {s.firstName[0]}{s.secondName[0]}
                                </div>
                                <div>
                                  <span className="text-white font-medium">
                                    {s.firstName} {s.secondName}
                                    {isMe && <span className="ml-2 text-xs text-slate-500">(you)</span>}
                                  </span>
                                  {s.isBanned && (
                                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400">Banned</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">{s.email}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${ROLE_STYLE[s.role] ?? 'bg-slate-700 text-slate-400'}`}>
                                {s.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {s.isBanned ? (
                                <span className="text-xs text-slate-600 italic">—</span>
                              ) : (
                                <select
                                  value={s.role}
                                  disabled={isMe || busy}
                                  onChange={(e) => handleRoleChange(s.id, e.target.value)}
                                  className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {s.isBanned ? (
                                <button
                                  disabled={busy}
                                  onClick={() => handleUnban(s.id, `${s.firstName} ${s.secondName}`)}
                                  className="px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {busy ? 'Working…' : 'Unban'}
                                </button>
                              ) : (
                                <button
                                  disabled={isMe || busy}
                                  onClick={() => handleBan(s.id, `${s.firstName} ${s.secondName}`)}
                                  className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {busy ? 'Working…' : 'Ban'}
                                </button>
                              )}
                            </td>
                          </tr>
                      )
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
          )}
        </main>
      </Layout><AddStaffModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchStaff}/></>
  )
}

export default StaffPage
