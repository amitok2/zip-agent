import { NextRequest } from 'next/server'
import { createSession, sendPrompt } from '@/lib/opencode'

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId: clientSessionId } = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 })
    }

    // Get or create session
    let sessionId = clientSessionId
    if (!sessionId) {
      const session = await createSession()
      sessionId = session.id
    }

    // Send prompt to OpenCode and get streaming response
    const openCodeStream = await sendPrompt(sessionId, message)

    // Parse SSE events from OpenCode and extract text content
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = openCodeStream.getReader()
        let buffer = ''
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            // Process SSE events in the buffer
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              const trimmed = line.trim()

              // Handle SSE data lines
              if (trimmed.startsWith('data:')) {
                const data = trimmed.slice(5).trim()
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  // Extract text content from various possible event shapes
                  const text =
                    parsed?.content?.text ||
                    parsed?.text ||
                    parsed?.delta?.text ||
                    parsed?.choices?.[0]?.delta?.content ||
                    ''
                  if (text) {
                    controller.enqueue(encoder.encode(text))
                  }
                } catch {
                  // If not JSON, treat as plain text
                  if (data && data !== '[DONE]') {
                    controller.enqueue(encoder.encode(data))
                  }
                }
              }
              // Handle plain text (non-SSE response)
              else if (trimmed && !trimmed.startsWith(':') && !trimmed.startsWith('event:') && !trimmed.startsWith('id:')) {
                // Try parsing as JSON first
                try {
                  const parsed = JSON.parse(trimmed)
                  const text =
                    parsed?.content?.text ||
                    parsed?.text ||
                    parsed?.delta?.text ||
                    ''
                  if (text) {
                    controller.enqueue(encoder.encode(text))
                  }
                } catch {
                  // Plain text fallback
                  controller.enqueue(encoder.encode(trimmed))
                }
              }
            }
          }

          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer.trim())
              const text = parsed?.content?.text || parsed?.text || ''
              if (text) {
                controller.enqueue(encoder.encode(text))
              }
            } catch {
              if (buffer.trim() && !buffer.trim().startsWith(':')) {
                controller.enqueue(encoder.encode(buffer.trim()))
              }
            }
          }

          controller.close()
        } catch (err) {
          console.error('Stream processing error:', err)
          controller.error(err)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Session-Id': sessionId,
      }
    })

  } catch (err) {
    const e = err as { message?: string }
    console.error('Chat error:', e)
    return new Response(`Internal server error: ${e?.message ?? 'unknown error'}`, { status: 500 })
  }
}
