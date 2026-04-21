import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { GenerationSnapshot, Genotype, GenotypeLabelSet } from '../sim/types'

interface PopulationViewProps {
  snapshot: GenerationSnapshot
  genotypeLabels: GenotypeLabelSet
}

function buildDotSample(snapshot: GenerationSnapshot, dotCount: number): Genotype[] {
  const AA = Math.round((snapshot.counts.AA / snapshot.population) * dotCount)
  const Aa = Math.round((snapshot.counts.Aa / snapshot.population) * dotCount)
  const aa = dotCount - AA - Aa

  return [
    ...Array.from({ length: AA }, () => 'AA' as const),
    ...Array.from({ length: Aa }, () => 'Aa' as const),
    ...Array.from({ length: Math.max(0, aa) }, () => 'aa' as const),
  ]
}

const colorByGenotype: Record<Genotype, string> = {
  AA: 'bg-slate-400',
  Aa: 'bg-indigo-300',
  aa: 'bg-rose-400',
}

export function PopulationView({ snapshot, genotypeLabels }: PopulationViewProps) {
  const dots = useMemo(() => buildDotSample(snapshot, 264), [snapshot])

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
        <span>Animated cohort sample</span>
        <span>n = {snapshot.population.toLocaleString()}</span>
      </div>

      <motion.div
        className="grid grid-cols-12 gap-1 sm:[grid-template-columns:repeat(16,minmax(0,1fr))] xl:[grid-template-columns:repeat(22,minmax(0,1fr))]"
        layout
      >
        {dots.map((genotype, index) => (
          <motion.div
            key={`${genotype}-${index}`}
            layout
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className={`h-3 w-3 rounded-full ${colorByGenotype[genotype]}`}
            aria-label={genotype}
          />
        ))}
      </motion.div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          {genotypeLabels.AA}
        </span>
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-indigo-300" />
          {genotypeLabels.Aa}
        </span>
        <span className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          {genotypeLabels.aa}
        </span>
      </div>
    </div>
  )
}
