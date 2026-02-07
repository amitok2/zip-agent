import { getClient } from '@/lib/opencode'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const client = getClient()
    const { data } = await client.session.list()

    if (!data || !Array.isArray(data)) {
      return Response.json([])
    }

    const sessions = data
      .map((s: Record<string, unknown>) => {
        const time = (s.time || {}) as Record<string, unknown>
        return {
          id: s.id as string,
          title: (s.title as string) || 'שיחה ללא כותרת',
          createdAt: new Date(time.created as number).toISOString(),
          updatedAt: new Date(time.updated as number).toISOString(),
        }
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return Response.json(sessions)
  } catch (err) {
    console.error('Sessions list error:', err)
    return Response.json([], { status: 200 })
  }
}
