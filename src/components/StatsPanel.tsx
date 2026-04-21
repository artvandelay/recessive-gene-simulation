import type {
  GenerationSnapshot,
  Genotype,
  GenotypeLabelSet,
  MetricLabelSet,
} from '../sim/types'

interface StatsPanelProps {
  current: GenerationSnapshot
  previous: GenerationSnapshot | null
  genotypeLabels: GenotypeLabelSet
  metricLabels?: Partial<MetricLabelSet>
}

const GENOTYPE_ORDER: readonly Genotype[] = ['AA', 'Aa', 'aa']

export function StatsPanel({
  current,
  previous,
  genotypeLabels,
  metricLabels,
}: StatsPanelProps) {
  const delta = previous
    ? formatDelta(current.population - previous.population)
    : null

  const metrics = [
    { label: 'Allele frequency q', value: current.alleleFrequencyQ.toFixed(4) },
    {
      label: metricLabels?.carrierPrevalence ?? 'Carrier prevalence',
      value: formatPercent(current.carrierPrevalence),
    },
    {
      label: metricLabels?.affectedPrevalence ?? 'Affected prevalence',
      value: formatPercent(current.affectedPrevalence),
    },
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <h3 className="text-sm font-semibold text-slate-200">Live Counters</h3>

      <div className="mt-3 flex items-baseline justify-between text-sm text-slate-300">
        <span>Population N</span>
        <span className="flex items-baseline gap-2">
          <span className="font-mono text-slate-100">
            {current.population.toLocaleString()}
          </span>
          {delta ? (
            <span className={`font-mono text-xs ${delta.className}`}>
              {delta.label}
            </span>
          ) : null}
        </span>
      </div>

      <dl className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-sm">
        {GENOTYPE_ORDER.map((genotype) => (
          <div
            key={genotype}
            className="flex items-center justify-between text-slate-300"
          >
            <dt>{genotypeLabels[genotype]}</dt>
            <dd className="font-mono text-slate-100">
              {current.counts[genotype].toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>

      <dl className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center justify-between text-xs text-slate-300"
          >
            <dt>{metric.label}</dt>
            <dd className="font-mono text-slate-100">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function formatDelta(delta: number): { label: string; className: string } {
  if (delta === 0) return { label: '±0', className: 'text-slate-400' }
  if (delta > 0) {
    return {
      label: `+${delta.toLocaleString()}`,
      className: 'text-emerald-300',
    }
  }
  return { label: delta.toLocaleString(), className: 'text-rose-300' }
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}
