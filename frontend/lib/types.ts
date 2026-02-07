export type ToolStatus = 'pending' | 'running' | 'completed' | 'error'

export type StreamPart =
  | { type: 'text'; id: string; text: string }
  | { type: 'reasoning'; id: string; text: string }
  | {
      type: 'tool'
      id: string
      tool: string
      callID: string
      status: ToolStatus
      input: Record<string, unknown>
      output?: string
      title?: string
      time?: { start: number; end?: number }
    }
  | {
      type: 'step-finish'
      id: string
      cost: number
      tokens: { input: number; output: number; reasoning: number }
    }

export interface Message {
  role: 'user' | 'assistant'
  content?: string
  parts: StreamPart[]
  error?: string
}

export interface SessionInfo {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export type SSEEvent =
  | { type: 'part.text'; id: string; delta: string; text: string }
  | { type: 'part.reasoning'; id: string; delta: string; text: string }
  | {
      type: 'part.tool'
      id: string
      tool: string
      callID: string
      status: ToolStatus
      input: Record<string, unknown>
      output?: string
      title?: string
      time?: { start: number; end?: number }
    }
  | {
      type: 'part.step-finish'
      id: string
      cost: number
      tokens: { input: number; output: number; reasoning: number }
    }
  | { type: 'error'; message: string }
  | { type: 'done' }
