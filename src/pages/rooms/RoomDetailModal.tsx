import { useEffect, useState } from 'react'
import type { Room, RoomPhoto } from '../../types/room'
import { getPhotosByRoom, uploadPhoto } from '../../api/rooms'
import { STATUS_STYLE, TYPE_STYLE } from './constants'

interface RoomDetailModalProps {
  room: Room | null
  onClose: () => void
}

export function RoomDetailModal({ room, onClose }: RoomDetailModalProps) {
  const [photos, setPhotos] = useState<RoomPhoto[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhotos([])
    if (room == null) return
    getPhotosByRoom(room.id, 1, 20).then((data) => setPhotos(data.items))
  }, [room])

  const uploadPhotosHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0 || room == null) return
    await Promise.all(files.map((file) => uploadPhoto(room.id, file)))
    getPhotosByRoom(room.id, 1, 20).then((data) => setPhotos(data.items))
  }

  if (!room) return null

  const status = STATUS_STYLE[room.status]
  const typeStyle = TYPE_STYLE[room.type] ?? 'bg-slate-700 text-slate-300'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-3xl font-bold text-white">#{room.roomNumber}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${typeStyle}`}>
                {room.type}
              </span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {room.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Description</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            {room.description || 'No description provided.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Type</p>
            <p className="text-sm text-white font-medium">{room.type}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <p className="text-sm text-white font-medium">{room.status}</p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Photos</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((p) => (
                <img
                  key={p.id}
                  src={p.url}
                  className="h-24 w-36 object-cover rounded-lg shrink-0 border border-slate-700"
                  alt={p.id}
                />
              ))}
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={uploadPhotosHandler}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="w-full py-2.5 mb-2 text-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-colors cursor-pointer block"
        >
          Upload Photos
        </label>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
