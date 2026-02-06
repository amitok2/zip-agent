'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import TextareaAutosize from 'react-textarea-autosize'
import { Send, BarChart3 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: '' }])
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        })
      })

      // Read session ID from response header
      const newSessionId = res.headers.get('X-Session-Id')
      if (newSessionId) {
        setSessionId(newSessionId)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += new TextDecoder().decode(value)
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: acc }
          return next
        })
      }
    } catch (err) {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { role: 'assistant', content: 'שגיאה בחיבור לשרת. נסה שוב.' }
        return next
      })
    } finally {
      setIsLoading(false)
    }
  }

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
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`${m.role === 'user' ? 'message-user' : 'message-assistant text-gray-800'} rounded-2xl px-4 py-3 max-w-[85%]`}>
                {m.role === 'assistant' ? (
                  m.content ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="thinking-dots flex items-center gap-1 py-1">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-right">{m.content}</p>
                )}
              </div>
            </div>
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
