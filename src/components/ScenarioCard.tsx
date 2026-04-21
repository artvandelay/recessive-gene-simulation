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
      {preset.highlights.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {preset.highlights.map((label) => (
            <span
              key={label}
              className={clsx(
                'rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                selected
                  ? 'border-indigo-300/60 bg-indigo-300/10 text-indigo-100'
                  : 'border-slate-600 bg-slate-900/70 text-slate-300',
              )}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  )
}
