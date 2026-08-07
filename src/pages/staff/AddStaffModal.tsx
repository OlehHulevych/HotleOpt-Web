import { useState } from 'react'
import { toast } from 'sonner'
import { registerStaff } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const ROLES = ['Staff', 'Manager']

export function AddStaffModal({ isOpen, onClose, onSuccess }: Props) {
  const me = useAuthStore((s) => s.user)
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '', role: 'Staff' })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!me?.tenantId || !me?.propertyId) return
    setLoading(true)
    try {
      await registerStaff({
        name: form.name,
        surname: form.surname,
        email: form.email,
        password: form.password,
        role: form.role,
        tenantId: me.tenantId,
        propertyId: me.propertyId,
      })
      toast.success(`${form.name} ${form.surname} added to your team`)
      setForm({ name: '', surname: '', email: '', password: '', role: 'Staff' })
      onSuccess()
      onClose()
    } catch {
      toast.error('Failed to add staff member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <h2 className="text-white font-semibold">Add Staff Member</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">First Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Last Name</label>
              <input
                required
                value={form.surname}
                onChange={(e) => set('surname', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding…' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
