import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { useTranslation } from 'react-i18next'
import { Layout } from '../components/Layout'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import { getMessages } from '../api/messages'
import { translateText } from '../api/translate'
import type { Message } from '../types/message'

export function ChatPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const propertyId = user?.propertyId

  const language = useLanguageStore((s) => s.language)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [translating, setTranslating] = useState<Record<string, boolean>>({})
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

  const handleTranslate = async (msgId: string, content: string) => {
    if (translations[msgId] !== undefined) {
      setTranslations((prev) => { const next = { ...prev }; delete next[msgId]; return next })
      return
    }
    setTranslating((prev) => ({ ...prev, [msgId]: true }))
    try {
      const translated = await translateText(content, language)
      setTranslations((prev) => ({ ...prev, [msgId]: translated }))
    } finally {
      setTranslating((prev) => ({ ...prev, [msgId]: false }))
    }
  }

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
    <Layout>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-white">{t('chat.title')}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{t('chat.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-cyan-400' : 'bg-slate-500'}`} />
            <span className="text-xs text-slate-400">{connected ? t('chat.connected') : t('chat.connecting')}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              {t('chat.empty')}
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
                      {isMe ? t('chat.you') : m.senderName} · {fmt(m.createdAt)}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-cyan-500 text-white rounded-tr-sm'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                    }`}>
                      {translations[m.id] ?? m.content}
                    </div>
                    <button
                      onClick={() => handleTranslate(m.id, m.content)}
                      disabled={translating[m.id]}
                      className={`flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-50 ${isMe ? 'self-end' : ''}`}
                    >
                      {translating[m.id] ? (
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      )}
                      {translations[m.id] !== undefined ? t('chat.showOriginal') : t('chat.translate')}
                    </button>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="px-4 sm:px-8 py-5 border-t border-slate-800 shrink-0">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.typeMessage')}
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
    </Layout>
  )
}
