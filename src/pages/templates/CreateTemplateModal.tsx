import { useState } from 'react'
import type { RoomType } from '../../types/template'
import { createTemplate } from '../../api/templates'
import { toast } from 'sonner'

const ROOM_TYPES: RoomType[] = ['Single', 'Double', 'Twin', 'Suite', 'Deluxe']

interface Props {
  isOpen: boolean
  propertyId: string
  onClose: () => void
  onSuccess: () => void
}

export function CreateTemplateModal({ isOpen, propertyId, onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [roomType, setRoomType] = useState<RoomType>('Single')
  const [items, setItems] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const addItem = () => setItems((prev) => [...prev, ''])
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, val: string) =>
    setItems((prev) => prev.map((v, idx) => (idx === i ? val : v)))

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Template name is required'); return }
    const filledItems = items.map((t) => t.trim()).filter(Boolean)
    if (filledItems.length === 0) { toast.error('Add at least one checklist item'); return }

    setLoading(true)
    try {
      await createTemplate({
        name: name.trim(),
        roomType,
        propertyId,
        items: filledItems.map((title, idx) => ({ title, order: idx + 1 })),
      })
      toast.success('Template created')
      setName(''); setRoomType('Single'); setItems([''])
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <h2 className="text-white font-semibold">New Template</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">Template name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suite Turndown"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Room type */}
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">Room type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Checklist items */}
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-2">Checklist items</label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-5 text-right shrink-0">{i + 1}.</span>
                  <input
                    value={item}
                    onChange={(e) => updateItem(i, e.target.value)}
                    placeholder={`Item ${i + 1}`}
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addItem}
              className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add item
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
