import type { Room } from '../../types/room'
import { STATUS_STYLE, TYPE_STYLE } from './constants'

interface RoomCardProps {
  room: Room
  onView: () => void
  onEdit: () => void
}

export function RoomCard({ room, onView, onEdit }: RoomCardProps) {
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

      <p className="text-slate-400 text-sm line-clamp-2 mb-4 min-h-10">
        {room.description || 'No description'}
      </p>

      <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
        <button
          onClick={onView}
          className="flex-1 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
        >
          View Details
        </button>
        <button
          onClick={onEdit}
          className="flex-1 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
