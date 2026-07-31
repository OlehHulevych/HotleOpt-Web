import { useEffect, useState } from 'react'
import { createTask } from '../../api/task'
import { getRoomsByProperty } from '../../api/rooms'
import { getUsers } from '../../api/users'
import type { Room } from '../../types/room'
import type { UserDto } from '../../types/user'

interface Props {
  isOpen: boolean
  propertyId: string
  onClose: () => void
  onSuccess: () => void
}

export function AddTaskModal({ isOpen, propertyId, onClose, onSuccess }: Props) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [staff, setStaff] = useState<UserDto[]>([])
  const [title, setTitle] = useState('')
  const [roomId, setRoomId] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    getRoomsByProperty(propertyId).then((r) => setRooms(r.items))
    getUsers().then((u) => setStaff(u))
  }, [isOpen, propertyId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const scheduledAt = `${scheduledDate}T${scheduledTime}`
      await createTask({ title, assignedToId, roomId, scheduledAt, propertyId })
      onSuccess()
      onClose()
    } catch {
      setError('Failed to create task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Add Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean and restock room"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Room</label>
            <select
              required
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select a room...</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>#{r.roomNumber} — {r.type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Assign To</label>
            <select
              required
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">Select staff member...</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.secondName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Scheduled Date & Time</label>
            <div className="flex gap-2">
              <input
                required
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                required
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {error && <p className="text-rose-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
