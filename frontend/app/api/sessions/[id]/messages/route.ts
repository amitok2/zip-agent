import { NextRequest } from 'next/server'
import { getClient } from '@/lib/opencode'
import type { Message, StreamPart, ToolStatus } from '@/lib/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const client = getClient()
    const { data } = await client.session.messages({ path: { id } })

    if (!data || !Array.isArray(data)) {
      return Response.json([])
    }

    const messages: Message[] = []

    for (const msg of data) {
      const wrapper = msg as Record<string, unknown>
      // SDK returns { info: Message, parts: Part[] }
      const info = (wrapper.info || wrapper) as Record<string, unknown>
      const rawParts = (wrapper.parts || []) as Record<string, unknown>[]
      const role = info.role as string

      if (role === 'user') {
        const text = rawParts
          .filter((p) => p.type === 'text')
          .map((p) => (p.text || '') as string)
          .join('\n')
        messages.push({ role: 'user', content: text, parts: [] })
      } else if (role === 'assistant') {
        const frontendParts: StreamPart[] = []

        for (const p of rawParts) {
          const partType = p.type as string
          const partId = (p.id || `${partType}-${Date.now()}-${Math.random()}`) as string

          if (partType === 'text') {
            frontendParts.push({ type: 'text', id: partId, text: (p.text || '') as string })
          } else if (partType === 'reasoning') {
            frontendParts.push({ type: 'reasoning', id: partId, text: (p.text || '') as string })
          } else if (partType === 'tool') {
            const state = (p.state || {}) as Record<string, unknown>
            frontendParts.push({
              type: 'tool',
              id: partId,
              tool: (p.tool || '') as string,
              callID: (p.callID || p.id || '') as string,
              status: (state.status || 'completed') as ToolStatus,
              input: (state.input || {}) as Record<string, unknown>,
              output: state.output as string | undefined,
              title: state.title as string | undefined,
              time: state.time as { start: number; end?: number } | undefined,
            })
          } else if (partType === 'step-finish') {
            frontendParts.push({
              type: 'step-finish',
              id: partId,
              cost: (p.cost || 0) as number,
              tokens: (p.tokens || { input: 0, output: 0, reasoning: 0 }) as { input: number; output: number; reasoning: number },
            })
          }
        }

        messages.push({ role: 'assistant', parts: frontendParts })
      }
    }

    return Response.json(messages)
  } catch (err) {
    console.error('Session messages error:', err)
    return Response.json([], { status: 200 })
  }
}
