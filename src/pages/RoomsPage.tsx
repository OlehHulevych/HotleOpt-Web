import {useEffect, useState} from 'react'
import Sidebar from '../components/Sidebar'
import type { Room, RoomStatus } from '../types/room'
import {getRooms} from "../api/rooms.ts";

const STATUS_TABS: { label: string; value: RoomStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Available', value: 'Available' },
  { label: 'Occupied', value: 'Occupied' },
  { label: 'Cleaning', value: 'Cleaning' },
  { label: 'Maintenance', value: 'Maintenance' },
]

const STATUS_STYLE: Record<RoomStatus, { badge: string; dot: string }> = {
  Available:   { badge: 'bg-cyan-500/10 text-cyan-400',    dot: 'bg-cyan-400' },
  Occupied:    { badge: 'bg-violet-500/10 text-violet-400', dot: 'bg-violet-400' },
  Cleaning:    { badge: 'bg-amber-500/10 text-amber-400',  dot: 'bg-amber-400' },
  Maintenance: { badge: 'bg-rose-500/10 text-rose-400',    dot: 'bg-rose-400' },
}

const TYPE_STYLE: Record<string, string> = {
  Single:  'bg-slate-700 text-slate-300',
  Double:  'bg-slate-700 text-slate-300',
  Twin:    'bg-slate-700 text-slate-300',
  Suite:   'bg-purple-500/10 text-purple-400',
  Deluxe:  'bg-yellow-500/10 text-yellow-400',
}

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [activeStatus, setActiveStatus] = useState<RoomStatus | 'All'>('All')
  const [search, setSearch] = useState('')

  // TODO: fetch rooms on mount and when activeStatus changes
  // use getRooms() or getRoomsByProperty() from src/api/rooms.ts

  const filtered = rooms.filter((r) => {
    const matchStatus = activeStatus === 'All' || r.status === activeStatus
    const matchSearch = r.roomNumber.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getRooms().then((data) => setRooms(data.items)).finally(() => setLoading(false))
  }, [])
  return (
      <div className="flex min-h-screen bg-[#0F172A]">
        <Sidebar/>

        <main className="flex-1 p-8 overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">Rooms</h1>
              <p className="text-slate-400 text-sm mt-0.5">{rooms.length} total</p>
            </div>
            <button
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add Room
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Status tabs */}
            <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1">
              {STATUS_TABS.map((tab) => (
                  <button
                      key={tab.value}
                      onClick={() => setActiveStatus(tab.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeStatus === tab.value
                              ? 'bg-slate-700 text-white'
                              : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    {tab.label}
                  </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search room number..."
                  className="pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Grid */}
          {loading ? (
              <div className="flex items-center justify-center h-64">
                <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
          ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <p className="text-sm">No rooms found</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filtered.map((room) => (
                    <RoomCard key={room.id} room={room}/>
                ))}
              </div>
          )}
        </main>
      </div>
  )
}

function RoomCard({ room }: { room: Room }) {
  const status = STATUS_STYLE[room.status]
  const typeStyle = TYPE_STYLE[room.type] ?? 'bg-slate-700 text-slate-300'

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-2xl font-bold text-white">#{room.roomNumber}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${typeStyle}`}>
            {room.type}
          </span>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {room.status}
        </span>
      </div>

      <p className="text-slate-400 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
        {room.description || 'No description'}
      </p>

      <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
        <button className="flex-1 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
          View Details
        </button>
        <button className="flex-1 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors">
          Edit
        </button>
      </div>
    </div>
  )
}
