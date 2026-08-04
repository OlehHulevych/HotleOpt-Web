import type { RoomStatus } from '../../types/room'

export const STATUS_TABS: { labelKey: string; value: RoomStatus | 'All' }[] = [
  { labelKey: 'common.all', value: 'All' },
  { labelKey: 'status.available', value: 'Available' },
  { labelKey: 'status.occupied', value: 'Occupied' },
  { labelKey: 'status.cleaning', value: 'Cleaning' },
  { labelKey: 'status.maintenance', value: 'Maintenance' },
]

export const STATUS_STYLE: Record<RoomStatus, { badge: string; dot: string }> = {
  Available:   { badge: 'bg-cyan-500/10 text-cyan-400',    dot: 'bg-cyan-400' },
  Occupied:    { badge: 'bg-violet-500/10 text-violet-400', dot: 'bg-violet-400' },
  Cleaning:    { badge: 'bg-amber-500/10 text-amber-400',  dot: 'bg-amber-400' },
  Maintenance: { badge: 'bg-rose-500/10 text-rose-400',    dot: 'bg-rose-400' },
}

export const TYPE_STYLE: Record<string, string> = {
  Single:  'bg-slate-700 text-slate-300',
  Double:  'bg-slate-700 text-slate-300',
  Twin:    'bg-slate-700 text-slate-300',
  Suite:   'bg-purple-500/10 text-purple-400',
  Deluxe:  'bg-yellow-500/10 text-yellow-400',
}
