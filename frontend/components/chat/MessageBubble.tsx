'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { Message } from '@/lib/types'
import TextPart from './TextPart'
import ReasoningPart from './ReasoningPart'
import ToolCallPart from './ToolCallPart'

interface MessageBubbleProps {
  message: Message
  isLoading?: boolean
}

export default function MessageBubble({ message, isLoading }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  if (message.role === 'user') {
    return (
      <div className="flex justify-start">
        <div className="message-user rounded-2xl px-4 py-3 max-w-[85%]">
          <p className="whitespace-pre-wrap text-sm text-right">{message.content}</p>
        </div>
      </div>
    )
  }

  // Assistant message
  const hasParts = message.parts.length > 0
  const hasError = !!message.error
  const textParts = message.parts.filter((p) => p.type === 'text')
  const canCopy = !isLoading && textParts.length > 0

  const handleCopy = async () => {
    const text = textParts.map((p) => p.type === 'text' ? p.text : '').join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex justify-end">
      <div className="group relative message-assistant text-gray-800 rounded-2xl px-4 py-3 max-w-[85%] w-full">
        {canCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            title="העתק"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}

        {!hasParts && !hasError && isLoading && (
          <div className="thinking-dots flex items-center gap-1 py-1">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {/* Show single thinking indicator while reasoning is active */}
        {isLoading && message.parts.some((p) => p.type === 'reasoning') &&
          !message.parts.some((p) => p.type === 'text') && (
            <ReasoningPart key="thinking" />
        )}

        {message.parts.map((part) => {
          switch (part.type) {
            case 'text':
              return <TextPart key={part.id} text={part.text} />
            case 'reasoning':
              // Hidden — shown as overlay above
              return null
            case 'tool':
              return (
                <ToolCallPart
                  key={part.id}
                  tool={part.tool}
                  status={part.status}
                  input={part.input}
                  output={part.output}
                  title={part.title}
                  time={part.time}
                />
              )
            case 'step-finish':
              return null
            default:
              return null
          }
        })}

        {hasError && (
          <p className="text-sm text-red-500">{message.error}</p>
        )}
      </div>
    </div>
  )
}
