import type { GenerationSnapshot } from '../sim/types'

interface StatsPanelProps {
  current: GenerationSnapshot
  history: GenerationSnapshot[]
}

function Sparkline({
  values,
  stroke,
}: {
  values: number[]
  stroke: string
}) {
  if (values.length <= 1) return null

  const width = 250
  const height = 80
  const max = Math.max(...values, 0.0001)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 0.0001)

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <polyline
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      points={points}
      strokeLinecap="round"
    />
  )
}

function metricRows(snapshot: GenerationSnapshot) {
  return [
    {
      label: 'Allele frequency q',
      value: snapshot.alleleFrequencyQ.toFixed(4),
    },
    {
      label: 'Carrier prevalence',
      value: `${(snapshot.carrierPrevalence * 100).toFixed(2)}%`,
    },
    {
      label: 'Affected prevalence',
      value: `${(snapshot.affectedPrevalence * 100).toFixed(2)}%`,
    },
  ]
}

export function StatsPanel({ current, history }: StatsPanelProps) {
  const affectedSeries = history.map((item) => item.affectedPrevalence)
  const carrierSeries = history.map((item) => item.carrierPrevalence)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <h3 className="text-sm font-semibold text-slate-200">Live Counters</h3>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-300">
          <span>AA</span>
          <span className="font-mono text-slate-100">
            {current.counts.AA.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Aa</span>
          <span className="font-mono text-slate-100">
            {current.counts.Aa.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>aa</span>
          <span className="font-mono text-slate-100">
            {current.counts.aa.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-2">
        {metricRows(current).map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between text-xs text-slate-300"
          >
            <span>{metric.label}</span>
            <span className="font-mono text-slate-100">{metric.value}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-300">Trend preview (carrier vs affected)</p>
      <svg viewBox="0 0 250 80" className="mt-2 h-24 w-full">
        <Sparkline values={carrierSeries} stroke="#a5b4fc" />
        <Sparkline values={affectedSeries} stroke="#fb7185" />
      </svg>
    </div>
  )
}
