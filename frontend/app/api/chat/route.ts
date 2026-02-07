import { NextRequest } from 'next/server'
import { getClient } from '@/lib/opencode'
import type { ToolStatus } from '@/lib/types'

const OPENCODE_URL = process.env.OPENCODE_URL || 'http://backend:4096'

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId: clientSessionId } = await req.json()

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 })
    }

    const client = getClient()

    // Get or create session
    let sessionId = clientSessionId
    if (!sessionId) {
      const { data: session } = await client.session.create()
      if (!session) {
        return new Response('Failed to create session', { status: 500 })
      }
      sessionId = session.id
    }

    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 120_000)

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        function send(data: Record<string, unknown>) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          } catch {
            // controller already closed
          }
        }

        try {
          // 1. Subscribe to backend SSE event stream
          const eventRes = await fetch(`${OPENCODE_URL}/event`, {
            signal: ac.signal,
            headers: { Accept: 'text/event-stream' },
          })

          if (!eventRes.ok || !eventRes.body) {
            send({ type: 'error', message: 'Failed to connect to event stream' })
            controller.close()
            clearTimeout(timeout)
            return
          }

          // 2. Fire prompt_async (returns 204, non-blocking)
          fetch(`${OPENCODE_URL}/session/${sessionId}/prompt_async`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parts: [{ type: 'text', text: message }],
            }),
            signal: ac.signal,
          }).catch((err) => {
            console.error('prompt_async error:', err)
            send({ type: 'error', message: 'Failed to start prompt' })
          })

          // 3. Parse SSE frames from backend
          const reader = eventRes.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          // Track text parts for delta computation
          const textAccumulator = new Map<string, string>()
          // Track assistant message IDs — only forward parts from assistant messages
          const assistantMsgIds = new Set<string>()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const eventData = line.slice(6)
              if (!eventData) continue

              try {
                const payload = JSON.parse(eventData)
                const eventType = payload.type as string

                // Filter events for our session
                const evtSessionId = payload.properties?.sessionID || payload.properties?.part?.sessionID || payload.properties?.info?.sessionID
                if (evtSessionId && evtSessionId !== sessionId) continue

                // Track assistant message IDs from message.updated events
                if (eventType === 'message.updated') {
                  const info = payload.properties?.info
                  if (info?.role === 'assistant' && info?.id) {
                    assistantMsgIds.add(info.id)
                  }
                  continue
                }

                if (eventType === 'message.part.updated') {
                  const part = payload.properties?.part
                  if (!part) continue

                  // Skip parts from non-assistant messages (e.g. user echo)
                  if (part.messageID && !assistantMsgIds.has(part.messageID)) continue

                  const partType = part.type as string
                  const partId = part.id || `${partType}-${Date.now()}`

                  if (partType === 'text') {
                    const fullText = (part.text || '') as string
                    const prev = textAccumulator.get(partId) || ''
                    const delta = fullText.slice(prev.length)
                    textAccumulator.set(partId, fullText)
                    if (delta) {
                      send({ type: 'part.text', id: partId, delta, text: fullText })
                    }
                  } else if (partType === 'reasoning') {
                    const fullText = (part.text || '') as string
                    const prev = textAccumulator.get(partId) || ''
                    const delta = fullText.slice(prev.length)
                    textAccumulator.set(partId, fullText)
                    if (delta) {
                      send({ type: 'part.reasoning', id: partId, delta, text: fullText })
                    }
                  } else if (partType === 'tool') {
                    // Tool data is nested under part.state
                    const state = part.state || {}
                    send({
                      type: 'part.tool',
                      id: partId,
                      tool: part.tool || '',
                      callID: part.callID || part.id || '',
                      status: (state.status || 'running') as ToolStatus,
                      input: state.input || {},
                      output: state.output,
                      title: state.title,
                      time: state.time,
                    })
                  } else if (partType === 'step-finish') {
                    send({
                      type: 'part.step-finish',
                      id: partId,
                      cost: part.cost || 0,
                      tokens: part.tokens || { input: 0, output: 0, reasoning: 0 },
                    })
                  }
                  // skip step-start and other unknown types
                } else if (eventType === 'session.idle') {
                  send({ type: 'done' })
                  reader.cancel()
                  break
                } else if (eventType === 'session.error') {
                  send({
                    type: 'error',
                    message: payload.properties?.error || 'Session error',
                  })
                  reader.cancel()
                  break
                }
              } catch {
                // Skip unparseable frames
              }
            }
          }
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('SSE stream error:', err)
            send({ type: 'error', message: (err as Error).message || 'Stream error' })
          }
        } finally {
          clearTimeout(timeout)
          try { controller.close() } catch { /* already closed */ }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Session-Id': sessionId,
      },
    })
  } catch (err) {
    const e = err as { message?: string }
    console.error('Chat error:', e)
    return new Response(`Internal server error: ${e?.message ?? 'unknown error'}`, { status: 500 })
  }
}
