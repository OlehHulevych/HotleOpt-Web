import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import Sidebar from '../components/Sidebar'
import { useAuthStore } from '../store/authStore'
import { getMessages } from '../api/messages'
import type { Message } from '../types/message'

export function ChatPage() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const propertyId = user?.propertyId

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!propertyId || !token) return

    getMessages(propertyId).then((data) => {
      setMessages(data.items)
      setLoading(false)
    })

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat?propertyId=${propertyId}&access_token=${token}`)
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveMessage', (content: string, senderId: string, senderName: string) => {
      const msg: Message = {
        id: crypto.randomUUID(),
        content,
        senderId,
        senderName,
        propertyId: propertyId,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, msg])
    })

    connection.start()
      .then(() => setConnected(true))
      .catch(() => setConnected(false))

    connectionRef.current = connection

    return () => {
      connection.stop()
    }
  }, [propertyId, token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) return
    await connectionRef.current.invoke('SendMessage', input.trim())
    setInput('')
  }

  function fmt(date: string) {
    return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-white">Team Chat</h1>
            <p className="text-slate-400 text-sm mt-0.5">Property staff channel</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-cyan-400' : 'bg-slate-500'}`} />
            <span className="text-xs text-slate-400">{connected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === user?.id
              return (
                <div key={m.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 font-medium shrink-0">
                    {m.senderName?.[0]}
                  </div>
                  <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <span className={`text-xs text-slate-500 ${isMe ? 'text-right' : ''}`}>
                      {isMe ? 'You' : m.senderName} · {fmt(m.createdAt)}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-cyan-500 text-white rounded-tr-sm'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="px-8 py-5 border-t border-slate-800 shrink-0">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={!connected}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!connected || !input.trim()}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
