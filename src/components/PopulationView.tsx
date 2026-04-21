import { useMemo } from 'react'
import type { GenerationSnapshot, Genotype, GenotypeLabelSet } from '../sim/types'

interface PopulationViewProps {
  snapshots: GenerationSnapshot[]
  currentIndex: number
  genotypeLabels: GenotypeLabelSet
}

// SVG viewport in abstract units; the element scales fluidly to its container.
const VIEW = {
  width: 900,
  height: 360,
  padding: { top: 8, right: 8, bottom: 22, left: 44 },
} as const

const PLOT_WIDTH = VIEW.width - VIEW.padding.left - VIEW.padding.right
const PLOT_HEIGHT = VIEW.height - VIEW.padding.top - VIEW.padding.bottom
const AXIS_Y = VIEW.padding.top + PLOT_HEIGHT

const GENOTYPE_COLOR: Record<Genotype, string> = {
  AA: '#94a3b8', // slate-400
  Aa: '#a5b4fc', // indigo-300
  aa: '#fb7185', // rose-400
}

// Painted bottom to top so the most severe genotype sits on the x-axis.
const STACK_ORDER: readonly Genotype[] = ['aa', 'Aa', 'AA']
const LEGEND_ORDER: readonly Genotype[] = ['AA', 'Aa', 'aa']

const PALETTE = {
  axis: '#334155',
  grid: '#1e293b',
  axisLabel: '#94a3b8',
  mutedLabel: '#64748b',
  cursor: '#e2e8f0',
} as const

interface Segment {
  genotype: Genotype
  y: number
  height: number
}

interface Bar {
  index: number
  x: number
  width: number
  segments: Segment[]
}

export function PopulationView({
  snapshots,
  currentIndex,
  genotypeLabels,
}: PopulationViewProps) {
  const { bars, yTicks, maxN } = useMemo(() => {
    const maxPop = snapshots.reduce((max, s) => Math.max(max, s.population), 1)
    return {
      bars: buildBars(snapshots, maxPop),
      yTicks: buildYTicks(maxPop),
      maxN: maxPop,
    }
  }, [snapshots])

  const cursor = bars[currentIndex] ?? null
  const xLabels = xLabelIndices(snapshots.length)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="mb-2 flex items-baseline justify-between text-xs text-slate-300">
        <span>Population over generations</span>
        <span className="text-slate-400">bar height = N · stack = genotype counts</span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {yTicks.map((tick) => {
          const y = AXIS_Y - (tick / maxN) * PLOT_HEIGHT
          return (
            <g key={tick}>
              <line
                x1={VIEW.padding.left}
                x2={VIEW.padding.left + PLOT_WIDTH}
                y1={y}
                y2={y}
                stroke={PALETTE.grid}
              />
              <text
                x={VIEW.padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill={PALETTE.axisLabel}
              >
                {tick.toLocaleString()}
              </text>
            </g>
          )
        })}

        {bars.slice(0, currentIndex + 1).map((bar) => (
          <g key={bar.index}>
            {bar.segments.map((seg) => (
              <rect
                key={seg.genotype}
                x={bar.x}
                y={seg.y}
                width={bar.width}
                height={seg.height}
                fill={GENOTYPE_COLOR[seg.genotype]}
              />
            ))}
          </g>
        ))}

        <line
          x1={VIEW.padding.left}
          x2={VIEW.padding.left + PLOT_WIDTH}
          y1={AXIS_Y}
          y2={AXIS_Y}
          stroke={PALETTE.axis}
        />

        {cursor ? (
          <line
            x1={cursor.x + cursor.width / 2}
            x2={cursor.x + cursor.width / 2}
            y1={VIEW.padding.top}
            y2={AXIS_Y}
            stroke={PALETTE.cursor}
            strokeDasharray="2 3"
          />
        ) : null}

        {xLabels.map((i) => (
          <text
            key={i}
            x={VIEW.padding.left + ((i + 0.5) / snapshots.length) * PLOT_WIDTH}
            y={AXIS_Y + 14}
            textAnchor="middle"
            fontSize={10}
            fill={PALETTE.mutedLabel}
          >
            {i}
          </text>
        ))}

        <text
          x={VIEW.padding.left + PLOT_WIDTH / 2}
          y={VIEW.height - 4}
          textAnchor="middle"
          fontSize={10}
          fill={PALETTE.mutedLabel}
        >
          generation
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
        {LEGEND_ORDER.map((g) => (
          <LegendSwatch key={g} color={GENOTYPE_COLOR[g]} label={genotypeLabels[g]} />
        ))}
      </div>
    </div>
  )
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <i className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  )
}

function buildBars(snapshots: GenerationSnapshot[], maxPop: number): Bar[] {
  const columnWidth = PLOT_WIDTH / Math.max(snapshots.length, 1)
  const scale = PLOT_HEIGHT / maxPop

  return snapshots.map((snap, index) => {
    let cursorY = AXIS_Y
    const segments: Segment[] = STACK_ORDER.map((genotype) => {
      const height = snap.counts[genotype] * scale
      cursorY -= height
      return { genotype, y: cursorY, height }
    })
    return {
      index,
      x: VIEW.padding.left + index * columnWidth,
      width: Math.max(columnWidth - 0.5, 0.5),
      segments,
    }
  })
}

/** Nice-looking Y-axis tick values up to `maxN`, stepped in 1/2/5 × 10ⁿ. */
function buildYTicks(maxN: number): number[] {
  if (maxN <= 0) return [0]
  const rough = maxN / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = ([1, 2, 5, 10].find((m) => m * magnitude >= rough) ?? 10) * magnitude
  const ticks: number[] = []
  for (let v = 0; v <= maxN; v += step) ticks.push(v)
  return ticks
}

/** X-axis labels at first, midpoint, and last generation (deduplicated for tiny runs). */
function xLabelIndices(count: number): number[] {
  if (count === 0) return []
  const last = count - 1
  return [...new Set([0, Math.floor(last / 2), last])].sort((a, b) => a - b)
}
