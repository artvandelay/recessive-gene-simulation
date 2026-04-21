import type { Dispatch, ReactNode, SetStateAction } from 'react'
import clsx from 'clsx'
import {
  controlSections,
  controlsForSection,
  type ControlSectionId,
  type ControlSpec,
} from '../sim/controlSchema'
import type {
  ControlKey,
  DiseaseProfile,
  Genotype,
  ParamInfo,
  SimulationModifiers,
  SimulationParams,
  TreatmentShiftConfig,
} from '../sim/types'

interface ControlPanelProps {
  params: SimulationParams
  baselineParams: SimulationParams
  profile: DiseaseProfile
  onParamsChange: Dispatch<SetStateAction<SimulationParams>>
  onReset: () => void
}

// ---------------------------------------------------------------------------
// Accessors: one table maps every ControlKey to a get/set lens over params.
// Replaces the previous 160 lines of parallel switch statements.
// ---------------------------------------------------------------------------

type ControlValue = number | boolean

interface Accessor {
  get: (params: SimulationParams) => ControlValue
  set: (params: SimulationParams, value: ControlValue) => SimulationParams
}

const root = <K extends keyof SimulationParams>(key: K): Accessor => ({
  get: (p) => p[key] as ControlValue,
  set: (p, v) => ({ ...p, [key]: v }),
})

const modifier = <K extends keyof SimulationModifiers>(key: K): Accessor => ({
  get: (p) => p.modifiers[key] as ControlValue,
  set: (p, v) => ({ ...p, modifiers: { ...p.modifiers, [key]: v } }),
})

const survival = (genotype: Genotype): Accessor => ({
  get: (p) => p.survivalToReproductiveAge[genotype],
  set: (p, v) => ({
    ...p,
    survivalToReproductiveAge: {
      ...p.survivalToReproductiveAge,
      [genotype]: v,
    },
  }),
})

const fertility = (genotype: Genotype): Accessor => ({
  get: (p) => p.fertilityMultiplier[genotype],
  set: (p, v) => ({
    ...p,
    fertilityMultiplier: { ...p.fertilityMultiplier, [genotype]: v },
  }),
})

const treatment = <K extends keyof TreatmentShiftConfig>(key: K): Accessor => ({
  get: (p) => p.treatmentShift[key] as ControlValue,
  set: (p, v) => ({
    ...p,
    treatmentShift: { ...p.treatmentShift, [key]: v },
  }),
})

const ACCESSORS: Record<ControlKey, Accessor> = {
  initialPopulation: root('initialPopulation'),
  initialAlleleFrequency: root('initialAlleleFrequency'),
  fixedPopulationSize: root('fixedPopulationSize'),
  averageChildrenPerCouple: root('averageChildrenPerCouple'),
  mutationRate: root('mutationRate'),
  generations: root('generations'),

  carrierPairingBias: modifier('carrierPairingBias'),
  consanguinityBoost: modifier('consanguinityBoost'),
  endogamyBias: modifier('endogamyBias'),
  malariaPressure: modifier('malariaPressure'),
  heterozygoteAdvantageStrength: modifier('heterozygoteAdvantageStrength'),

  survivalWAA: survival('AA'),
  survivalWAa: survival('Aa'),
  survivalWaa: survival('aa'),
  fertilityFAA: fertility('AA'),
  fertilityFAa: fertility('Aa'),
  fertilityFaa: fertility('aa'),

  treatmentShiftEnabled: treatment('enabled'),
  treatmentStartGeneration: treatment('startsAtGeneration'),
  treatmentImprovedSurvival: treatment('improvedSurvivalAA'),
  treatmentImprovedFertility: treatment('improvedFertilityAA'),
}

const readControl = (params: SimulationParams, key: ControlKey) =>
  ACCESSORS[key].get(params)

const writeControl = (
  params: SimulationParams,
  key: ControlKey,
  value: ControlValue,
): SimulationParams => ACCESSORS[key].set(params, value)

function isControlModified(
  params: SimulationParams,
  baseline: SimulationParams,
  key: ControlKey,
): boolean {
  const current = readControl(params, key)
  const original = readControl(baseline, key)
  if (typeof current === 'number' && typeof original === 'number') {
    return Math.abs(current - original) > 1e-9
  }
  return current !== original
}

function isControlVisible(
  spec: ControlSpec,
  params: SimulationParams,
  visible: Set<ControlKey>,
): boolean {
  if (!visible.has(spec.key)) return false
  if (!spec.requiresControl) return true
  return Boolean(readControl(params, spec.requiresControl))
}

// ---------------------------------------------------------------------------
// Presentational pieces
// ---------------------------------------------------------------------------

function Section({
  title,
  caption,
  onReset,
  children,
}: {
  title: string
  caption?: string
  onReset?: () => void
  children: ReactNode
}) {
  return (
    <section className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            {title}
          </h3>
          {caption ? (
            <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
              {caption}
            </p>
          ) : null}
        </div>
        {onReset ? (
          <button
            type="button"
            className="shrink-0 rounded border border-slate-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300 hover:border-slate-500 hover:text-slate-100"
            onClick={onReset}
          >
            Reset section
          </button>
        ) : null}
      </div>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}

function InfoBubble({ info }: { info: ParamInfo }) {
  return (
    <span className="group/info relative inline-flex">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-600 text-[10px] font-bold text-slate-300 hover:border-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label={`More detail on ${info.label}`}
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-6 z-30 hidden w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-700 bg-slate-900 p-3 text-[11px] text-slate-200 shadow-xl break-words group-hover/info:block group-focus-within/info:block"
      >
        <span className="block text-xs font-semibold text-slate-100">
          {info.label}
        </span>
        <span className="mt-2 block">
          <span className="font-semibold text-slate-100">What:</span> {info.what}
        </span>
        <span className="mt-1 block">
          <span className="font-semibold text-slate-100">Reasonable:</span>{' '}
          {info.reasonable}
        </span>
        <span className="mt-1 block">
          <span className="font-semibold text-slate-100">Extremes:</span>{' '}
          {info.extremes}
        </span>
      </span>
    </span>
  )
}

function ControlLabel({
  label,
  info,
  modified,
}: {
  label: string
  info: ParamInfo
  modified: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {modified ? (
        <span
          aria-label="Modified from preset"
          title="Modified from preset"
          className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]"
        />
      ) : null}
      <span>{label}</span>
      <InfoBubble info={info} />
    </span>
  )
}

// ---------------------------------------------------------------------------
// Input controls. Each variant is a small, focused component.
// ---------------------------------------------------------------------------

interface ControlInputProps {
  spec: ControlSpec
  value: ControlValue
  info: ParamInfo
  modified: boolean
  onChange: (value: ControlValue) => void
}

function ToggleControl({ spec, value, info, modified, onChange }: ControlInputProps) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-300">
      <ControlLabel label={spec.label} info={info} modified={modified} />
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  )
}

function NumberControl({ spec, value, info, modified, onChange }: ControlInputProps) {
  return (
    <div className="block text-xs text-slate-300">
      <div className="mb-1">
        <ControlLabel label={spec.label} info={info} modified={modified} />
      </div>
      <input
        type="number"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={Number(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className={clsx(
          'w-full rounded border bg-slate-900 px-2 py-1 text-sm',
          modified ? 'border-amber-500/60' : 'border-slate-700',
        )}
      />
    </div>
  )
}

function SliderControl({ spec, value, info, modified, onChange }: ControlInputProps) {
  const numeric = Number(value)
  const formatted = numeric.toFixed(spec.valueDecimals ?? 2)
  return (
    <div className="block">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <ControlLabel label={spec.label} info={info} modified={modified} />
        <span className="font-mono text-slate-200">{formatted}</span>
      </div>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={numeric}
        onChange={(event) => onChange(Number(event.target.value))}
        className={clsx('w-full', modified ? 'accent-amber-400' : 'accent-indigo-400')}
      />
    </div>
  )
}

const INPUT_COMPONENTS = {
  toggle: ToggleControl,
  number: NumberControl,
  slider: SliderControl,
} satisfies Record<ControlSpec['inputType'], (props: ControlInputProps) => ReactNode>

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

interface ControlGroup {
  label: string | null
  items: ControlSpec[]
}

/** Cluster consecutive controls that share a `group` label so we can render
 *  them under a single sub-heading (e.g. "Genotype survival"). */
function groupControls(controls: ControlSpec[]): ControlGroup[] {
  const groups: ControlGroup[] = []
  for (const control of controls) {
    const label = control.group ?? null
    const last = groups[groups.length - 1]
    if (last && last.label === label) {
      last.items.push(control)
    } else {
      groups.push({ label, items: [control] })
    }
  }
  return groups
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ControlPanel({
  params,
  baselineParams,
  profile,
  onParamsChange,
  onReset,
}: ControlPanelProps) {
  const visibleSet = new Set(profile.visibleControls)

  const updateControl = (key: ControlKey, value: ControlValue) =>
    onParamsChange((prev) => writeControl(prev, key, value))

  const resetSection = (section: ControlSectionId) => {
    const controls = controlsForSection(section, profile.visibleControls)
    onParamsChange((prev) =>
      controls.reduce(
        (acc, c) => writeControl(acc, c.key, readControl(baselineParams, c.key)),
        prev,
      ),
    )
  }

  return (
    <div className="mt-4">
      {controlSections.map((section) => {
        const sectionControls = controlsForSection(
          section.id,
          profile.visibleControls,
        ).filter((spec) => isControlVisible(spec, params, visibleSet))
        if (sectionControls.length === 0) return null

        return (
          <Section
            key={section.id}
            title={section.title}
            caption={section.caption}
            onReset={() => resetSection(section.id)}
          >
            {groupControls(sectionControls).map((group, index) => (
              <div
                key={group.label ?? `ungrouped-${index}`}
                className={clsx(
                  group.label &&
                    'rounded-md border border-slate-800/60 bg-slate-900/40 p-2',
                )}
              >
                {group.label ? (
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </p>
                ) : null}
                <div className="space-y-3">
                  {group.items.map((spec) => {
                    const Input = INPUT_COMPONENTS[spec.inputType]
                    return (
                      <Input
                        key={spec.key}
                        spec={spec}
                        value={readControl(params, spec.key)}
                        info={profile.tooltipOverrides?.[spec.key] ?? spec.info}
                        modified={isControlModified(params, baselineParams, spec.key)}
                        onChange={(value) => updateControl(spec.key, value)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </Section>
        )
      })}

      <button
        type="button"
        className="mt-4 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700"
        onClick={onReset}
      >
        Reset all to selected preset
      </button>
    </div>
  )
}
