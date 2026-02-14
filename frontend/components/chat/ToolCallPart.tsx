'use client'

import { useState } from 'react'
import {
  Database,
  Table,
  Search,
  BarChart3,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import type { ToolStatus } from '@/lib/types'

const TOOL_META: Record<string, { label: string; icon: typeof Database }> = {
  'fashion-bi_run_query': { label: 'שאילתת SQL', icon: Database },
  'fashion-bi_get_schema': { label: 'מבנה בסיס נתונים', icon: Table },
  'fashion-bi_search_data': { label: 'חיפוש נתונים', icon: Search },
  'fashion-bi_get_kpi_summary': { label: 'סיכום מדדים', icon: BarChart3 },
}

interface ToolCallPartProps {
  tool: string
  status: ToolStatus
  input: Record<string, unknown>
  output?: string
  title?: string
  time?: { start: number; end?: number }
}

function formatDuration(time?: { start: number; end?: number }) {
  if (!time?.start || !time.end) return null
  return ((time.end - time.start) / 1000).toFixed(1) + 's'
}

function tryParseOutput(output?: string): unknown {
  if (!output) return null
  try {
    return JSON.parse(output)
  } catch {
    return output
  }
}

/** Check if tool output contains an error despite "completed" status */
function hasErrorInOutput(output?: string): boolean {
  if (!output) return false
  try {
    const parsed = JSON.parse(output)
    if (typeof parsed === 'object' && parsed !== null && 'error' in parsed) return true
  } catch {
    // not JSON — check for common error patterns in plain text
  }
  return false
}

function OutputPreview({ output }: { output?: string }) {
  const parsed = tryParseOutput(output)
  if (!parsed) return <p className="text-[11px] text-slate-400">אין תוצאות</p>

  if (typeof parsed === 'string') {
    return <pre className="text-[11px] text-slate-500 whitespace-pre-wrap max-h-40 overflow-auto" dir="ltr">{parsed}</pre>
  }

  // Check for {rows: [...]} structure from the MCP tool
  const data = (parsed as Record<string, unknown>)
  const rows = Array.isArray(data.rows) ? data.rows as Record<string, unknown>[] : null

  if (rows && rows.length > 0 && typeof rows[0] === 'object') {
    const cols = Object.keys(rows[0])
    const preview = rows.slice(0, 5)
    const remaining = rows.length - 5

    return (
      <div className="overflow-x-auto" dir="ltr">
        <table className="text-[11px] w-full border-collapse">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} className="text-left px-2 py-1 border-b border-slate-200 text-slate-500 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c} className="px-2 py-1 border-b border-slate-100 text-slate-600">
                    {String(row[c] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {remaining > 0 ? (
          <p className="text-[10px] text-slate-400 mt-1 text-right" dir="rtl">
            ועוד {remaining} שורות
          </p>
        ) : null}
      </div>
    )
  }

  // Plain array
  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
    const arrRows = parsed as Record<string, unknown>[]
    const cols = Object.keys(arrRows[0])
    const preview = arrRows.slice(0, 5)
    const remaining = arrRows.length - 5

    return (
      <div className="overflow-x-auto" dir="ltr">
        <table className="text-[11px] w-full border-collapse">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} className="text-left px-2 py-1 border-b border-slate-200 text-slate-500 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c} className="px-2 py-1 border-b border-slate-100 text-slate-600">
                    {String(row[c] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {remaining > 0 ? (
          <p className="text-[10px] text-slate-400 mt-1 text-right" dir="rtl">
            ועוד {remaining} שורות
          </p>
        ) : null}
      </div>
    )
  }

  // Schema: single table {table, columns: [{name, type, ...}]}
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>
    if (obj.table && Array.isArray(obj.columns)) {
      const cols = obj.columns as Record<string, unknown>[]
      return (
        <div dir="ltr">
          <p className="text-[11px] text-slate-500 font-medium mb-1">{String(obj.table)}</p>
          <div className="overflow-x-auto">
            <table className="text-[11px] w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1 border-b border-slate-200 text-slate-500 font-medium">Column</th>
                  <th className="text-left px-2 py-1 border-b border-slate-200 text-slate-500 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {cols.map((col, i) => (
                  <tr key={i}>
                    <td className="px-2 py-0.5 border-b border-slate-100 text-slate-600 font-mono">{String(col.name || col.column_name || '')}</td>
                    <td className="px-2 py-0.5 border-b border-slate-100 text-slate-400">{String(col.type || col.data_type || '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    // Schema: all tables — object where values are arrays of {name, type}
    const entries = Object.entries(obj)
    const isAllTables = entries.length > 0 && entries.every(([, v]) => Array.isArray(v) && (v as unknown[]).length > 0 && typeof (v as unknown[])[0] === 'object')
    if (isAllTables) {
      return (
        <div className="space-y-2" dir="ltr">
          {entries.map(([table, columns]) => {
            const cols = columns as Record<string, unknown>[]
            return (
              <div key={table}>
                <p className="text-[11px] text-slate-500 font-medium mb-0.5">{table}</p>
                <div className="overflow-x-auto">
                  <table className="text-[11px] w-full border-collapse">
                    <tbody>
                      {cols.slice(0, 8).map((col, i) => (
                        <tr key={i}>
                          <td className="px-2 py-0 border-b border-slate-100 text-slate-600 font-mono">{String(col.name || col.column_name || '')}</td>
                          <td className="px-2 py-0 border-b border-slate-100 text-slate-400">{String(col.type || col.data_type || '')}</td>
                        </tr>
                      ))}
                      {cols.length > 8 && (
                        <tr><td colSpan={2} className="px-2 py-0 text-slate-400 text-[10px]">+{cols.length - 8} more</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    // General object fallback — use JSON.stringify for nested values
    return (
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]" dir="ltr">
        {entries.slice(0, 10).map(([k, v]) => (
          <div key={k} className="contents">
            <span className="text-slate-400">{k}</span>
            <span className="text-slate-600">{typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default function ToolCallPart({ tool, status, input, output, title, time }: ToolCallPartProps) {
  const [expanded, setExpanded] = useState(false)
  const [sqlExpanded, setSqlExpanded] = useState(false)
  const meta = TOOL_META[tool] || { label: tool, icon: Database }
  const Icon = meta.icon
  const duration = formatDuration(time)
  const isActive = status === 'pending' || status === 'running'
  const isError = status === 'error' || (status === 'completed' && hasErrorInOutput(output))

  // Extract description from input (set by LLM) or fall back to title from OpenCode
  const description = (input.description as string) || title || ''

  // Extract SQL for run_query
  const sql = tool === 'fashion-bi_run_query' ? (input.sql || input.query) : null

  return (
    <div className={`tool-card ${isError ? 'tool-card-error' : ''} ${isActive ? 'tool-card-active' : ''}`}>
      {/* Single-line header */}
      <button
        type="button"
        onClick={() => { if (!isActive && !isError && output) setExpanded(!expanded) }}
        className={`flex items-center gap-2 w-full text-right ${!isActive && !isError && output ? 'cursor-pointer' : 'cursor-default'}`}
      >
        {isActive ? (
          <Loader2 size={13} className="animate-spin text-slate-400 shrink-0" />
        ) : isError ? (
          <AlertCircle size={13} className="text-red-400 shrink-0" />
        ) : (
          <Check size={13} className="text-slate-400 shrink-0" />
        )}
        <Icon size={13} className="text-slate-400 shrink-0" />
        <span className="text-[12px] text-slate-500 font-medium">{meta.label}</span>
        {description && (
          <>
            <span className="text-[11px] text-slate-300">—</span>
            <span className="text-[11px] text-slate-400 truncate max-w-[50%]">{description}</span>
          </>
        )}

        <span className="mr-auto" />

        {duration ? (
          <span className="text-[10px] text-slate-400 tabular-nums" dir="ltr">{duration}</span>
        ) : null}

        {!isActive && !isError && output ? (
          <ChevronDown
            size={12}
            className={`text-slate-300 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        ) : null}
      </button>

      {/* Collapsible SQL query */}
      {sql ? (
        <div className="mt-1">
          <button
            type="button"
            onClick={() => setSqlExpanded(!sqlExpanded)}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-500 font-mono cursor-pointer"
            dir="ltr"
          >
            <ChevronDown
              size={10}
              className={`transition-transform duration-200 ${sqlExpanded ? 'rotate-180' : '-rotate-90'}`}
            />
            SQL
          </button>
          {sqlExpanded && (
            <pre className="text-[11px] text-slate-500 font-mono whitespace-pre-wrap mt-1 px-2 py-1.5 bg-slate-50 rounded border border-slate-100 leading-relaxed" dir="ltr">
              {String(sql)}
            </pre>
          )}
        </div>
      ) : null}

      {/* Error message */}
      {isError && output ? (
        <p className="text-[11px] text-red-400 mt-1" dir="ltr">
          {(() => {
            try {
              const parsed = JSON.parse(output)
              if (typeof parsed === 'object' && parsed !== null && parsed.error) return String(parsed.error)
            } catch { /* not JSON */ }
            return output
          })()}
        </p>
      ) : null}

      {/* Expanded output */}
      {expanded && !isError ? (
        <div className="tool-card-output mt-2 pt-2 border-t border-slate-100">
          <OutputPreview output={output} />
        </div>
      ) : null}
    </div>
  )
}
