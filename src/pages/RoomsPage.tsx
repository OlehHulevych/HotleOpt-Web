import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/Sidebar'
import type { Room, RoomStatus } from '../types/room'
import { getRoomsByProperty } from '../api/rooms'
import { useAuthStore } from '../store/authStore'
import { STATUS_TABS } from './rooms/constants'
import { RoomCard } from './rooms/RoomCard'
import { RoomDetailModal } from './rooms/RoomDetailModal'
import { AddRoomModal } from './rooms/AddRoomModal'
import { EditRoomModal } from './rooms/EditRoomModal'
import { InspectionModal } from './rooms/InspectionModal'
import {Pagination} from "../components/Pagination.tsx";

export function RoomsPage() {
  const { t } = useTranslation()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [inspectRoom, setInspectRoom] = useState<Room | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState<RoomStatus | 'All'>('All')
  const [search, setSearch] = useState('')
  const user = useAuthStore((state) => state.user)
  const isManager = user?.role === 'Manager'
  const [page,setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchRooms = useCallback(() => {
    if (user?.propertyId == null) return
    setLoading(true)
    getRoomsByProperty(user.propertyId,undefined,page)
      .then((data) => {
        setRooms(data.items)
        setTotalPages(data.totalPages)
      })
      .finally(() => setLoading(false))
  }, [user?.propertyId,page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRooms()
  }, [fetchRooms])

  const filtered = rooms.filter((r) => {
    const matchStatus = activeStatus === 'All' || r.status === activeStatus
    const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <>
      <div className="flex min-h-screen bg-[#0F172A]">
        <Sidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">{t('rooms.title')}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{rooms.length} total</p>
            </div>
            {isManager && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('rooms.addRoom')}
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1">
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

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search room number..."
                className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">{t('rooms.empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filtered.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onView={() => setSelectedRoom(room)}
                  onEdit={() => setEditRoom(room)}
                />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </main>
      </div>

      <RoomDetailModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onInspect={() => { setInspectRoom(selectedRoom); setSelectedRoom(null) }}
      />
      <InspectionModal room={inspectRoom} onClose={() => setInspectRoom(null)} />
      <EditRoomModal room={editRoom} onClose={() => setEditRoom(null)} onSuccess={fetchRooms} />
      {isManager && user?.propertyId && (
        <AddRoomModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchRooms}
          propertyId={user.propertyId}
        />
      )}
    </>
  )
}
