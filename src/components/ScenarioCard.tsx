import clsx from 'clsx'
import type { ScenarioPreset } from '../sim/types'

interface ScenarioCardProps {
  preset: ScenarioPreset
  selected: boolean
  onClick: () => void
}

export function ScenarioCard({ preset, selected, onClick }: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full rounded-xl border p-3 text-left transition',
        selected
          ? 'border-indigo-400 bg-indigo-400/10'
          : 'border-slate-700 bg-slate-950/40 hover:border-slate-500',
      )}
    >
      <h3 className="text-sm font-semibold text-slate-100">{preset.title}</h3>
      <p className="mt-1 text-xs text-slate-300">{preset.description}</p>
    </button>
  )
}
