import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { inspectRoom, getInspections } from '../../api/inspections'
import type { Room } from '../../types/room'
import type { RoomInspection, InspectionResult } from '../../types/inspection'

interface Props {
  room: Room | null
  onClose: () => void
}

function fmt(date: string) {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function InspectionModal({ room, onClose }: Props) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [inspecting, setInspecting] = useState(false)
  const [result, setResult] = useState<InspectionResult | null>(null)
  const [history, setHistory] = useState<RoomInspection[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!room) return
    setResult(null)
    setError(null)
    setHistoryLoading(true)
    getInspections(room.id)
      .then((data) => setHistory(data.items))
      .finally(() => setHistoryLoading(false))
  }, [room])

  if (!room) return null

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setInspecting(true)
    setResult(null)
    setError(null)
    try {
      const res = await inspectRoom(room.id, room.propertyId, file)
      setResult(res)
      getInspections(room.id).then((data) => setHistory(data.items))
    } catch {
      setError('Inspection failed. Please try again.')
    } finally {
      setInspecting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div>
            <h2 className="text-white font-semibold">{t('inspections.title')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('rooms.room')} #{room.roomNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="inspect-upload"
            onChange={handleFile}
            disabled={inspecting}
          />
          <label
            htmlFor="inspect-upload"
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-colors ${
              inspecting
                ? 'border-slate-700 text-slate-500 cursor-not-allowed'
                : 'border-slate-600 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 cursor-pointer'
            }`}
          >
            {inspecting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-medium">{t('inspections.inspecting')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
                <span className="text-sm font-medium">{t('inspections.runInspection')}</span>
              </>
            )}
          </label>

          {error && <p className="text-rose-400 text-xs text-center">{error}</p>}

          {result && (
            <div className={`rounded-xl p-4 border ${
              result.passed
                ? 'border-emerald-700 bg-emerald-900/20'
                : 'border-rose-700 bg-rose-900/20'
            }`}>
              <p className={`text-sm font-semibold mb-1 ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.passed ? `✓ ${t('inspections.passed')}` : `✗ ${t('inspections.failed')}`}
              </p>
              {result.issues && (
                <p className="text-xs text-slate-300 leading-relaxed">{result.issues}</p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
              {t('inspections.history')}
            </p>
            {historyLoading ? (
              <div className="flex justify-center py-6">
                <svg className="animate-spin w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">{t('inspections.noHistory')}</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                    <img
                      src={item.photoUrl}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-700"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${item.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.passed ? `✓ ${t('inspections.passed')}` : `✗ ${t('inspections.failed')}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{fmt(item.inspectedAt)}</p>
                      {item.issues && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.issues}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
