'use client'

import { X, Plus, MessageSquare } from 'lucide-react'
import type { SessionInfo } from '@/lib/types'

interface SidebarProps {
  open: boolean
  onClose: () => void
  sessions: SessionInfo[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  loading?: boolean
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'עכשיו'
  if (minutes < 60) return `לפני ${minutes} דק׳`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `לפני ${hours} שע׳`
  const days = Math.floor(hours / 24)
  if (days < 7) return `לפני ${days} ימים`
  return new Date(dateStr).toLocaleDateString('he-IL')
}

export default function Sidebar({ open, onClose, sessions, activeSessionId, onSelectSession, onNewChat, loading }: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">היסטוריית שיחות</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
          >
            <Plus size={15} />
            שיחה חדשה
          </button>
        </div>

        <div className="overflow-y-auto px-3 pb-4" style={{ height: 'calc(100% - 120px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-blue-500" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">אין שיחות קודמות</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectSession(s.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-all ${
                    s.id === activeSessionId
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="mt-0.5 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{relativeTime(s.updatedAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
