import { useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/authStore'
import { uploadAvatar, getMe } from '../api/auth'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    setSuccess(false)
    try {
      await uploadAvatar(file)
      const updated = await getMe()
      setUser(updated)
      setSuccess(true)
    } catch {
      setError('Failed to upload avatar. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.secondName?.[0] ?? ''}`

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your account details</p>
        </div>

        <div className="max-w-lg">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-4">
            <h2 className="text-sm font-medium text-white mb-5">Avatar</h2>

            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-600"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-xl font-semibold text-slate-300">
                    {initials}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <svg className="animate-spin w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Change Avatar'}
                </button>
                <p className="text-xs text-slate-500 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
                {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
                {success && <p className="text-xs text-cyan-400 mt-1">Avatar updated successfully.</p>}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-5">Account Info</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                  <p className="text-sm text-white bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">{user?.firstName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                  <p className="text-sm text-white bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">{user?.secondName}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <p className="text-sm text-white bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">{user?.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                <p className="text-sm text-white bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
