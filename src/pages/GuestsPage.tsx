import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import type {Guest} from '../types/guest'
import {getGuests, deleteGuest} from '../api/guests'
import {useAuthStore} from '../store/authStore'
import {AddGuestModal} from './guests/AddGuestModal'
import {EditGuestModal} from './guests/EditGuestModal'
import { Pagination } from '../components/Pagination'

export function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [editGuest, setEditGuest] = useState<Guest | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const user = useAuthStore((state) => state.user)
  const isManager = user?.role === 'Manager'

  const fetchGuests = useCallback(() => {
    setLoading(true)
    getGuests(page)
      .then((data) => { setGuests(data.items); setTotalPages(data.totalPages) })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGuests()
  }, [fetchGuests])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return
    await deleteGuest(id)
    fetchGuests()
  }

  const filtered = guests.filter((g) => {
    const full = `${g.firstName} ${g.lastName} ${g.email}`.toLowerCase()
    return full.includes(search.toLowerCase())
  })

  return (
    <>
      <div className="flex min-h-screen bg-[#0F172A]">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">Guests</h1>
              <p className="text-slate-400 text-sm mt-0.5">{guests.length} total</p>
            </div>
            {isManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Guest
              </button>
            )}
          </div>

          <div className="relative mb-6 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 pr-4 py-2 w-full bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">No guests found</p>
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Phone</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Passport</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filtered.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-semibold shrink-0">
                            {g.firstName[0]}{g.lastName[0]}
                          </div>
                          <span className="text-white font-medium">{g.firstName} {g.lastName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{g.email}</td>
                      <td className="px-5 py-3.5 text-slate-300">{g.phone}</td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{g.passportNumber}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditGuest(g)}
                            className="px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          {isManager && (
                            <button
                              onClick={() => handleDelete(g.id)}
                              className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </main>
      </div>

      <EditGuestModal guest={editGuest} onClose={() => setEditGuest(null)} onSuccess={fetchGuests} />
      <AddGuestModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchGuests} />
    </>
  )
}
