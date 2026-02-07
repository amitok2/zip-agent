'use client'

import { Brain } from 'lucide-react'

export default function ReasoningPart() {
  return (
    <div className="thinking-overlay inline-flex" dir="rtl">
      <div className="flex items-center gap-2">
        <Brain size={14} className="text-blue-400 animate-pulse" />
        <span className="text-[12px] text-slate-500 font-medium">חושב...</span>
      </div>
    </div>
  )
}
