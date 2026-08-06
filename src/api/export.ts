import client from './client'

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const exportBookings = async (propertyId: string) => {
  const res = await client.get(`/api/export/bookings/${propertyId}`, { responseType: 'blob' })
  download(res.data, 'bookings.csv')
}

export const exportTasks = async (propertyId: string) => {
  const res = await client.get(`/api/export/tasks/${propertyId}`, { responseType: 'blob' })
  download(res.data, 'tasks.csv')
}
