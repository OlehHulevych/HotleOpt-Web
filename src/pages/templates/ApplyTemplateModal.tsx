import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskTemplateDto } from '../../types/template'
import type { Room } from '../../types/room'
import type { UserDto } from '../../types/user'
import { applyTemplate } from '../../api/templates'
import { getRoomsByProperty } from '../../api/rooms'
import { getUsers } from '../../api/users'
import { toast } from 'sonner'

interface Props {
  template: TaskTemplateDto | null
  propertyId: string
  onClose: () => void
  onSuccess: () => void
}

export function ApplyTemplateModal({ template, propertyId, onClose, onSuccess }: Props) {
  const { t } = useTranslation()
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<UserDto[]>([])
  const [roomId, setRoomId] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!template) return
    Promise.all([
      getRoomsByProperty(propertyId, undefined, 1, 100),
      getUsers(),
    ]).then(([roomData, userData]) => {
      setRooms(roomData.items)
      setUsers(userData)
    })
  }, [template, propertyId])

  if (!template) return null

  const handleApply = async () => {
    if (!roomId) { toast.error('Select a room'); return }
    if (!assignedToId) { toast.error('Select a staff member'); return }
    if (!scheduledAt) { toast.error('Select a scheduled date'); return }

    setLoading(true)
    try {
      await applyTemplate(template.id, {
        roomId,
        assignedToId,
        scheduledAt: new Date(scheduledAt).toISOString(),
      })
      toast.success(`${template.items.length} tasks created from template`)
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to apply template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-white font-semibold">{t('templates.applyTemplate')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{template.name} · {template.items.length} tasks</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Checklist preview */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-2 font-medium">{t('templates.willCreate')}</p>
            <ul className="space-y-1">
              {template.items.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Room */}
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">{t('rooms.room')}</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">{t('common.selectRoom')}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.type})</option>
              ))}
            </select>
          </div>

          {/* Assign to */}
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">{t('templates.assignTo')}</label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">{t('common.selectStaff')}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.secondName}</option>
              ))}
            </select>
          </div>

          {/* Scheduled date */}
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">{t('templates.scheduledDate')}</label>
            <input
              type="date"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleApply}
            disabled={loading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? t('templates.applying') : t('templates.applyTemplate')}
          </button>
        </div>
      </div>
    </div>
  )
}
