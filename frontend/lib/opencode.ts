import { createOpencodeClient } from '@opencode-ai/sdk/client'

const OPENCODE_URL = process.env.OPENCODE_URL || 'http://backend:4096'

export function getClient() {
  return createOpencodeClient({
    baseUrl: OPENCODE_URL,
  })
}
