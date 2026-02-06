const OPENCODE_URL = process.env.OPENCODE_URL || 'http://backend:4096'

export interface OpenCodeSession {
  id: string
}

export interface OpenCodeMessage {
  role: string
  content: string
}

export async function createSession(): Promise<OpenCodeSession> {
  const res = await fetch(`${OPENCODE_URL}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Failed to create session: ${res.status}`)
  }
  return res.json()
}

export async function getSession(sessionId: string): Promise<OpenCodeSession> {
  const res = await fetch(`${OPENCODE_URL}/session/${sessionId}`)
  if (!res.ok) {
    throw new Error(`Failed to get session: ${res.status}`)
  }
  return res.json()
}

export async function sendPrompt(
  sessionId: string,
  message: string
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${OPENCODE_URL}/session/${sessionId}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: message }),
  })
  if (!res.ok) {
    throw new Error(`Failed to send prompt: ${res.status}`)
  }
  if (!res.body) {
    throw new Error('No response body')
  }
  return res.body
}

export async function listSessions(): Promise<OpenCodeSession[]> {
  const res = await fetch(`${OPENCODE_URL}/session`)
  if (!res.ok) {
    throw new Error(`Failed to list sessions: ${res.status}`)
  }
  return res.json()
}
