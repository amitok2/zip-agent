interface StepBadgeProps {
  tokens: { input: number; output: number; reasoning: number }
  cost: number
}

export default function StepBadge({ tokens, cost }: StepBadgeProps) {
  const total = tokens.input + tokens.output + tokens.reasoning
  if (total === 0) return null

  return (
    <div className="flex justify-end mt-1">
      <span className="text-[10px] text-slate-400">
        {total.toLocaleString()} tokens {cost > 0 && `• $${cost.toFixed(4)}`}
      </span>
    </div>
  )
}
