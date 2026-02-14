'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Send, BarChart3, History } from 'lucide-react'
import type { Message, SessionInfo, StreamPart, SSEEvent } from '@/lib/types'
import MessageBubble from '@/components/chat/MessageBubble'
import Sidebar from '@/components/chat/Sidebar'

function updateParts(parts: StreamPart[], event: SSEEvent): StreamPart[] {
  if (event.type === 'part.text') {
    const idx = parts.findIndex((p) => p.type === 'text' && p.id === event.id)
    if (idx >= 0) {
      const updated = [...parts]
      updated[idx] = { type: 'text', id: event.id, text: event.text }
      return updated
    }
    return [...parts, { type: 'text', id: event.id, text: event.text }]
  }

  if (event.type === 'part.reasoning') {
    const idx = parts.findIndex((p) => p.type === 'reasoning' && p.id === event.id)
    if (idx >= 0) {
      const updated = [...parts]
      updated[idx] = { type: 'reasoning', id: event.id, text: event.text }
      return updated
    }
    return [...parts, { type: 'reasoning', id: event.id, text: event.text }]
  }

  if (event.type === 'part.tool') {
    const idx = parts.findIndex((p) => p.type === 'tool' && p.id === event.id)
    if (idx >= 0) {
      const updated = [...parts]
      updated[idx] = {
        type: 'tool',
        id: event.id,
        tool: event.tool,
        callID: event.callID,
        status: event.status,
        input: event.input,
        output: event.output,
        title: event.title,
        time: event.time,
      }
      return updated
    }
    return [
      ...parts,
      {
        type: 'tool',
        id: event.id,
        tool: event.tool,
        callID: event.callID,
        status: event.status,
        input: event.input,
        output: event.output,
        title: event.title,
        time: event.time,
      },
    ]
  }

  if (event.type === 'part.step-finish') {
    const idx = parts.findIndex((p) => p.type === 'step-finish' && p.id === event.id)
    if (idx >= 0) {
      const updated = [...parts]
      updated[idx] = { type: 'step-finish', id: event.id, cost: event.cost, tokens: event.tokens }
      return updated
    }
    return [...parts, { type: 'step-finish', id: event.id, cost: event.cost, tokens: event.tokens }]
  }

  return parts
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const res = await fetch('/api/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true)
    fetchSessions()
  }, [fetchSessions])

  const handleSelectSession = useCallback(async (id: string) => {
    setLoadingHistory(true)
    setSidebarOpen(false)
    try {
      const res = await fetch(`/api/sessions/${id}/messages`)
      if (res.ok) {
        const data: Message[] = await res.json()
        setMessages(data)
        setSessionId(id)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const handleNewChat = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setSessionId(null)
    setIsLoading(false)
    setSidebarOpen(false)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      const userMessage = input.trim()
      setInput('')
      setIsLoading(true)

      // Abort any previous stream
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac

      // Add user message + empty assistant placeholder
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMessage, parts: [] },
        { role: 'assistant', parts: [] },
      ])

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, sessionId }),
          signal: ac.signal,
        })

        const newSessionId = res.headers.get('X-Session-Id')
        if (newSessionId) setSessionId(newSessionId)

        if (!res.ok || !res.body) {
          throw new Error(`Server error: ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw) continue

            let event: SSEEvent
            try {
              event = JSON.parse(raw)
            } catch {
              continue
            }

            if (event.type === 'done') {
              break
            }

            if (event.type === 'error') {
              setMessages((prev) => {
                const next = [...prev]
                const last = { ...next[next.length - 1] }
                last.error = event.type === 'error' ? event.message : 'Unknown error'
                next[next.length - 1] = last
                return next
              })
              break
            }

            // Update assistant parts
            setMessages((prev) => {
              const next = [...prev]
              const last = { ...next[next.length - 1] }
              last.parts = updateParts(last.parts, event)
              next[next.length - 1] = last
              return next
            })
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setMessages((prev) => {
          const next = [...prev]
          const last = { ...next[next.length - 1] }
          last.error = 'שגיאה בחיבור לשרת. נסה שוב.'
          // Mark any "running" tool calls as errored so they don't stay stuck
          last.parts = last.parts.map((p) =>
            p.type === 'tool' && p.status === 'running'
              ? { ...p, status: 'error' as const }
              : p,
          )
          next[next.length - 1] = last
          return next
        })
      } finally {
        // Mark any tool calls still showing as "running" to "completed"
        // This handles cases where the stream ended without proper completion signals
        setMessages((prev) => {
          const next = [...prev]
          const last = { ...next[next.length - 1] }
          const hasStuckTools = last.parts.some((p) => p.type === 'tool' && p.status === 'running')
          if (hasStuckTools) {
            last.parts = last.parts.map((p) =>
              p.type === 'tool' && p.status === 'running'
                ? { ...p, status: 'completed' as const }
                : p,
            )
            next[next.length - 1] = last
            return next
          }
          return prev
        })
        setIsLoading(false)
        fetchSessions()
      }
    },
    [input, isLoading, sessionId, fetchSessions],
  )

  const suggestions = [
    'כמה מכירות היו היום?',
    'מה הקטגוריה הכי נמכרת החודש?',
    'מי 10 הלקוחות הכי רווחיים?',
    'מה אחוז ההחזרות השבוע?',
    'מה המלאי הנמוך ביותר?',
    'השווה הכנסות החודש לחודש שעבר',
  ]

  return (
    <div className="min-h-screen">
      {/* History toggle button */}
      <button
        type="button"
        onClick={handleOpenSidebar}
        className="fixed top-4 right-4 z-30 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-all shadow-sm"
        title="היסטוריית שיחות"
      >
        <History size={18} />
      </button>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        loading={loadingSessions}
      />

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-36">
        {messages.length === 0 && (
          <div className="text-center mb-10 chat-container p-8" dir="rtl">
            <div className="flex items-center justify-center gap-3 mb-3">
              <BarChart3 size={28} className="text-blue-500" />
              <h1 className="text-3xl font-semibold tracking-tight text-gray-800">שלום!</h1>
            </div>
            <p className="text-xl text-gray-600">מה תרצה לדעת על העסק?</p>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="suggestion-button rounded-full px-4 py-2 text-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4 max-w-3xl mx-auto" dir="rtl">
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              isLoading={isLoading && i === messages.length - 1}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <form onSubmit={handleSubmit} className="fixed bottom-4 left-0 right-0">
        <div className="max-w-3xl mx-auto px-4" dir="rtl">
          <div className="chat-container flex items-end gap-2 px-3 py-2">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-button rounded-xl text-white h-9 w-9 flex items-center justify-center disabled:opacity-50"
              aria-label="שלח"
            >
              <Send size={16} />
            </button>
            <TextareaAutosize
              minRows={1}
              maxRows={8}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="שאל שאלה על העסק..."
              className="flex-1 resize-none text-sm outline-none py-2 text-right"
              dir="rtl"
            />
          </div>
        </div>
      </form>
    </div>
  )
}
