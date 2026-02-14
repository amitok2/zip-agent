# Change Summary — Branch `fix/task-timeout-ui-disconnect`

## Problem 1: Long-running tasks get disconnected from the UI

When a backend task (e.g. complex KPI query, multi-step analysis) takes longer than 2 minutes, the UI freezes — tool calls stay stuck showing a spinner forever, even though the backend has already completed. The user sees no completion, no error, and no final response.

**Root cause:** A hard 120-second timeout in the Next.js API route (`frontend/app/api/chat/route.ts` line 28) aborts the SSE stream via `AbortController`. The backend keeps running but the frontend connection is already dead and never receives the `session.idle` completion event.

## Problem 2: Tool error badge shows checkmark on failed tools

When an MCP tool (e.g. `run_query`) executes and returns an error response like `{"error": "..."}`, the OpenCode backend still reports `status: "completed"` because the tool execution itself succeeded (it returned a response). The UI shows a green checkmark badge, misleading the user into thinking the tool call was successful.

**Root cause:** The `ToolCallPart` component only checked the `status` field from OpenCode to determine the badge icon. It never inspected the actual output content for error payloads.

---

## File 1: `frontend/app/api/chat/route.ts`

### Change A — Timeout increased (line 28)

```typescript
// BEFORE:
const timeout = setTimeout(() => ac.abort(), 120_000)

// AFTER:
const timeout = setTimeout(() => ac.abort(), 600_000) // 10 minutes
```

**Why:** The 120-second hard timeout was the root cause of Problem 1. The `AbortController` aborts the SSE stream after 2 minutes, killing the connection between frontend and backend. Backend tasks that take 2-3+ minutes (sub-agent workflows, complex multi-query KPI analysis) continue running on the backend but the frontend has already disconnected and never receives the `session.idle` completion event. Increased to 10 minutes to cover virtually all realistic task durations.

### Change B — Keep-alive heartbeat added (new block after line 40)

```typescript
// ADDED:
const keepAlive = setInterval(() => {
  try {
    controller.enqueue(encoder.encode(': keep-alive\n\n'))
  } catch {
    clearInterval(keepAlive)
  }
}, 30_000)
```

**Why:** Even with a longer application timeout, intermediate infrastructure (reverse proxies, load balancers, Docker networking) can kill idle SSE connections if no data flows for a while. The `: keep-alive\n\n` is a standard SSE comment — it keeps the TCP connection alive without being treated as a data event by the frontend SSE parser (lines in `page.tsx` only process lines starting with `data: `). The interval is cleaned up in `finally` and on early close.

### Change C — Timeout sends error instead of silent abort (catch block, ~line 185)

```typescript
// BEFORE:
} catch (err) {
  if ((err as Error).name !== 'AbortError') {
    console.error('SSE stream error:', err)
    send({ type: 'error', message: (err as Error).message || 'Stream error' })
  }
}

// AFTER:
} catch (err) {
  if ((err as Error).name === 'AbortError') {
    send({ type: 'error', message: 'הפעולה ארכה זמן רב מדי. נסה שוב או פשט את השאלה.' })
  } else {
    console.error('SSE stream error:', err)
    send({ type: 'error', message: (err as Error).message || 'Stream error' })
  }
}
```

**Why:** Previously, `AbortError` was silently swallowed — the frontend got a closed stream with no explanation. Now it sends a user-facing Hebrew error message ("The operation took too long. Try again or simplify the question.") so the UI can display it properly.

### Change D — `clearInterval(keepAlive)` added in `finally` block and early-return path

**Why:** Prevents the keep-alive interval from leaking if the stream ends (normally or abnormally).

---

## File 2: `frontend/app/page.tsx`

### Change A — Catch block marks stuck tools as "error" (~line 228)

```typescript
// ADDED inside the catch block, after setting last.error:
last.parts = last.parts.map((p) =>
  p.type === 'tool' && p.status === 'running'
    ? { ...p, status: 'error' as const }
    : p,
)
```

**Why:** When a connection error occurs (caught by `catch`), any tool calls that were mid-execution ("running") will never receive their completion event. Without this fix, they stay stuck as "running" with an infinite spinner forever. Now they transition to "error" status, showing the red `AlertCircle` icon.

### Change B — Finally block marks stuck tools as "completed" (~line 237)

```typescript
// ADDED at the beginning of the finally block:
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
```

**Why:** The `finally` block runs after every stream end — both successful and error. This is a safety net: if the stream closed cleanly (no error thrown) but some tool calls never got their completion event (e.g. the backend sent `session.idle` before sending the final tool status update), those tools are transitioned to "completed" so they don't stay stuck. The check for `hasStuckTools` avoids unnecessary re-renders when everything is already resolved.

---

## File 3: `frontend/components/chat/ToolCallPart.tsx`

### Change A — New `hasErrorInOutput()` helper function (after line 44)

```typescript
// ADDED:
function hasErrorInOutput(output?: string): boolean {
  if (!output) return false
  try {
    const parsed = JSON.parse(output)
    if (typeof parsed === 'object' && parsed !== null && 'error' in parsed) return true
  } catch {
    // not JSON
  }
  return false
}
```

**Why:** The MCP tools (`run_query`, `get_kpi_summary`, etc.) return `{"error": "..."}` as their output string when something fails (SQL error, invalid period, forbidden query, etc.). But OpenCode marks the tool call status as `"completed"` because the MCP tool execution itself succeeded (it returned a response). This function inspects the actual output content to detect these "completed but failed" cases.

### Change B — `isError` logic updated (line 234)

```typescript
// BEFORE:
const isError = status === 'error'

// AFTER:
const isError = status === 'error' || (status === 'completed' && hasErrorInOutput(output))
```

**Why:** This is the core fix for the badge. Now `isError` is true in two cases: (1) OpenCode explicitly reports `status: 'error'`, or (2) status is `'completed'` but the output contains `{"error": "..."}`. This single boolean drives the badge icon, card styling, expand behavior, and error message display.

### Change C — Click handler and cursor updated (line 247-248)

```typescript
// BEFORE:
onClick={() => { if (status === 'completed' && output) setExpanded(!expanded) }}
className={`... ${status === 'completed' && output ? 'cursor-pointer' : 'cursor-default'}`}

// AFTER:
onClick={() => { if (!isActive && !isError && output) setExpanded(!expanded) }}
className={`... ${!isActive && !isError && output ? 'cursor-pointer' : 'cursor-default'}`}
```

**Why:** Previously, error-containing tool outputs (with `status: 'completed'`) were expandable and showed the `OutputPreview` component, which would try to render the error JSON as a data table. Now error cases are excluded from expand — the error message is shown inline instead.

### Change D — Chevron icon visibility (line 272)

```typescript
// BEFORE:
{status === 'completed' && output ? ( <ChevronDown ... /> ) : null}

// AFTER:
{!isActive && !isError && output ? ( <ChevronDown ... /> ) : null}
```

**Why:** Consistent with Change C — no expand chevron for error outputs.

### Change E — Error message display extracts from JSON (line 304)

```typescript
// BEFORE:
<p className="text-[11px] text-red-400 mt-1">{output}</p>

// AFTER:
<p className="text-[11px] text-red-400 mt-1" dir="ltr">
  {(() => {
    try {
      const parsed = JSON.parse(output)
      if (typeof parsed === 'object' && parsed !== null && parsed.error) return String(parsed.error)
    } catch { /* not JSON */ }
    return output
  })()}
</p>
```

**Why:** When the output is `{"error": "Query contains forbidden keywords..."}`, displaying the raw JSON string is ugly and confusing. This extracts just the error message string. Added `dir="ltr"` because error messages are typically in English (SQL errors, etc.).

### Change F — Expanded output guard (line 313)

```typescript
// BEFORE:
{expanded && status === 'completed' ? (

// AFTER:
{expanded && !isError ? (
```

**Why:** Prevents the `OutputPreview` component from rendering for error outputs (it would try to display `{"error": "..."}` as a data table).
