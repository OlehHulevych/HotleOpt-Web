import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { RoomType } from '../../types/room'
import { addRoom } from '../../api/rooms'

interface AddRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  propertyId: string
}

export function AddRoomModal({ isOpen, onClose, onSuccess, propertyId }: AddRoomModalProps) {
  const { t } = useTranslation()
  const [roomNumber, setRoomNumber] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<RoomType>('Single')
  const [pricePerNight, setPricePerNight] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await addRoom({ roomNumber, description, propertyId, type, pricePerNight: Number(pricePerNight) })
      onSuccess()
      onClose()
    } catch {
      setError('Failed to create room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{t('rooms.addRoom')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('rooms.roomNumber')}</label>
            <input
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 101"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('rooms.type')}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as RoomType)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {(['Single', 'Double', 'Twin', 'Suite', 'Deluxe'] as RoomType[]).map((rt) => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('rooms.pricePerNight')}</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="e.g. 120.00"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('common.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Room description..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {error && <p className="text-rose-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
              {loading ? t('common.creating') : t('rooms.createRoom')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
