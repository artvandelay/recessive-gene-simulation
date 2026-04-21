import type { Dispatch, ReactNode, SetStateAction } from 'react'
import clsx from 'clsx'
import {
  controlSections,
  controlsForSection,
  type ControlSectionId,
  type ControlSpec,
} from '../sim/controlSchema'
import type { ControlKey, DiseaseProfile, ParamInfo, SimulationParams } from '../sim/types'

interface ControlPanelProps {
  params: SimulationParams
  baselineParams: SimulationParams
  profile: DiseaseProfile
  onParamsChange: Dispatch<SetStateAction<SimulationParams>>
  onReset: () => void
}

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

function LabelWithInfo({
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

function formatNumericValue(value: number, decimals: number | undefined): string {
  const places = decimals ?? 2
  return value.toFixed(places)
}

function getControlValue(params: SimulationParams, control: ControlKey): number | boolean {
  switch (control) {
    case 'initialPopulation':
      return params.initialPopulation
    case 'initialAlleleFrequency':
      return params.initialAlleleFrequency
    case 'carrierPairingBias':
      return params.modifiers.carrierPairingBias
    case 'consanguinityBoost':
      return params.modifiers.consanguinityBoost
    case 'endogamyBias':
      return params.modifiers.endogamyBias
    case 'survivalWAA':
      return params.survivalToReproductiveAge.AA
    case 'survivalWAa':
      return params.survivalToReproductiveAge.Aa
    case 'survivalWaa':
      return params.survivalToReproductiveAge.aa
    case 'fertilityFAA':
      return params.fertilityMultiplier.AA
    case 'fertilityFAa':
      return params.fertilityMultiplier.Aa
    case 'fertilityFaa':
      return params.fertilityMultiplier.aa
    case 'mutationRate':
      return params.mutationRate
    case 'malariaPressure':
      return params.modifiers.malariaPressure
    case 'heterozygoteAdvantageStrength':
      return params.modifiers.heterozygoteAdvantageStrength
    case 'treatmentShiftEnabled':
      return params.treatmentShift.enabled
    case 'treatmentStartGeneration':
      return params.treatmentShift.startsAtGeneration
    case 'treatmentImprovedSurvival':
      return params.treatmentShift.improvedSurvivalAA
    case 'treatmentImprovedFertility':
      return params.treatmentShift.improvedFertilityAA
    case 'generations':
      return params.generations
    case 'fixedPopulationSize':
      return params.fixedPopulationSize
    case 'averageChildrenPerCouple':
      return params.averageChildrenPerCouple
  }
}

function setControlValue(
  state: SimulationParams,
  control: ControlKey,
  value: number | boolean,
): SimulationParams {
  switch (control) {
    case 'initialPopulation':
      return { ...state, initialPopulation: Number(value) }
    case 'initialAlleleFrequency':
      return { ...state, initialAlleleFrequency: Number(value) }
    case 'carrierPairingBias':
      return {
        ...state,
        modifiers: { ...state.modifiers, carrierPairingBias: Number(value) },
      }
    case 'consanguinityBoost':
      return {
        ...state,
        modifiers: { ...state.modifiers, consanguinityBoost: Number(value) },
      }
    case 'endogamyBias':
      return {
        ...state,
        modifiers: { ...state.modifiers, endogamyBias: Number(value) },
      }
    case 'survivalWAA':
      return {
        ...state,
        survivalToReproductiveAge: {
          ...state.survivalToReproductiveAge,
          AA: Number(value),
        },
      }
    case 'survivalWAa':
      return {
        ...state,
        survivalToReproductiveAge: {
          ...state.survivalToReproductiveAge,
          Aa: Number(value),
        },
      }
    case 'survivalWaa':
      return {
        ...state,
        survivalToReproductiveAge: {
          ...state.survivalToReproductiveAge,
          aa: Number(value),
        },
      }
    case 'fertilityFAA':
      return {
        ...state,
        fertilityMultiplier: { ...state.fertilityMultiplier, AA: Number(value) },
      }
    case 'fertilityFAa':
      return {
        ...state,
        fertilityMultiplier: { ...state.fertilityMultiplier, Aa: Number(value) },
      }
    case 'fertilityFaa':
      return {
        ...state,
        fertilityMultiplier: { ...state.fertilityMultiplier, aa: Number(value) },
      }
    case 'mutationRate':
      return { ...state, mutationRate: Number(value) }
    case 'malariaPressure':
      return {
        ...state,
        modifiers: { ...state.modifiers, malariaPressure: Boolean(value) },
      }
    case 'heterozygoteAdvantageStrength':
      return {
        ...state,
        modifiers: {
          ...state.modifiers,
          heterozygoteAdvantageStrength: Number(value),
        },
      }
    case 'treatmentShiftEnabled':
      return {
        ...state,
        treatmentShift: { ...state.treatmentShift, enabled: Boolean(value) },
      }
    case 'treatmentStartGeneration':
      return {
        ...state,
        treatmentShift: {
          ...state.treatmentShift,
          startsAtGeneration: Number(value),
        },
      }
    case 'treatmentImprovedSurvival':
      return {
        ...state,
        treatmentShift: {
          ...state.treatmentShift,
          improvedSurvivalAA: Number(value),
        },
      }
    case 'treatmentImprovedFertility':
      return {
        ...state,
        treatmentShift: {
          ...state.treatmentShift,
          improvedFertilityAA: Number(value),
        },
      }
    case 'generations':
      return { ...state, generations: Number(value) }
    case 'fixedPopulationSize':
      return { ...state, fixedPopulationSize: Boolean(value) }
    case 'averageChildrenPerCouple':
      return { ...state, averageChildrenPerCouple: Number(value) }
  }
}

function resetControlFromBaseline(
  state: SimulationParams,
  baseline: SimulationParams,
  control: ControlKey,
): SimulationParams {
  return setControlValue(state, control, getControlValue(baseline, control))
}

function isControlModified(
  params: SimulationParams,
  baseline: SimulationParams,
  control: ControlKey,
): boolean {
  const current = getControlValue(params, control)
  const original = getControlValue(baseline, control)
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
  const gate = getControlValue(params, spec.requiresControl)
  return Boolean(gate)
}

function renderControl(
  control: ControlSpec,
  params: SimulationParams,
  baseline: SimulationParams,
  profile: DiseaseProfile,
  onParamsChange: Dispatch<SetStateAction<SimulationParams>>,
): ReactNode {
  const value = getControlValue(params, control.key)
  const info = profile.tooltipOverrides?.[control.key] ?? control.info
  const modified = isControlModified(params, baseline, control.key)

  if (control.inputType === 'toggle') {
    return (
      <div
        key={control.key}
        className="flex items-center justify-between text-xs text-slate-300"
      >
        <LabelWithInfo label={control.label} info={info} modified={modified} />
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) =>
            onParamsChange((prev) =>
              setControlValue(prev, control.key, event.target.checked),
            )
          }
        />
      </div>
    )
  }

  const numericValue = Number(value)
  const valueText = formatNumericValue(numericValue, control.valueDecimals)

  if (control.inputType === 'number') {
    return (
      <div key={control.key} className="block text-xs text-slate-300">
        <div className="mb-1">
          <LabelWithInfo label={control.label} info={info} modified={modified} />
        </div>
        <input
          className={clsx(
            'w-full rounded border bg-slate-900 px-2 py-1 text-sm',
            modified ? 'border-amber-500/60' : 'border-slate-700',
          )}
          type="number"
          min={control.min}
          max={control.max}
          step={control.step}
          value={numericValue}
          onChange={(event) =>
            onParamsChange((prev) =>
              setControlValue(prev, control.key, Number(event.target.value)),
            )
          }
        />
      </div>
    )
  }

  return (
    <div key={control.key} className="block">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <LabelWithInfo label={control.label} info={info} modified={modified} />
        <span className="font-mono text-slate-200">{valueText}</span>
      </div>
      <input
        className={clsx(
          'w-full',
          modified ? 'accent-amber-400' : 'accent-indigo-400',
        )}
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={numericValue}
        onChange={(event) =>
          onParamsChange((prev) =>
            setControlValue(prev, control.key, Number(event.target.value)),
          )
        }
      />
    </div>
  )
}

function groupControls(controls: ControlSpec[]): Array<{
  group: string | null
  items: ControlSpec[]
}> {
  const groups: Array<{ group: string | null; items: ControlSpec[] }> = []
  for (const control of controls) {
    const key = control.group ?? null
    const last = groups[groups.length - 1]
    if (last && last.group === key) {
      last.items.push(control)
    } else {
      groups.push({ group: key, items: [control] })
    }
  }
  return groups
}

export function ControlPanel({
  params,
  baselineParams,
  profile,
  onParamsChange,
  onReset,
}: ControlPanelProps) {
  const visibleSet = new Set(profile.visibleControls)

  const resetSection = (section: ControlSectionId) => {
    const controls = controlsForSection(section, profile.visibleControls)
    onParamsChange((prev) => {
      let next = prev
      for (const control of controls) {
        next = resetControlFromBaseline(next, baselineParams, control.key)
      }
      return next
    })
  }

  return (
    <div className="mt-4">
      {controlSections.map((section) => {
        const sectionControls = controlsForSection(
          section.id,
          profile.visibleControls,
        ).filter((spec) => isControlVisible(spec, params, visibleSet))
        if (sectionControls.length === 0) return null

        const groups = groupControls(sectionControls)

        return (
          <Section
            key={section.id}
            title={section.title}
            caption={section.caption}
            onReset={() => resetSection(section.id)}
          >
            {groups.map((group, groupIndex) => (
              <div
                key={group.group ?? `ungrouped-${groupIndex}`}
                className={clsx(
                  group.group &&
                    'rounded-md border border-slate-800/60 bg-slate-900/40 p-2',
                )}
              >
                {group.group ? (
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.group}
                  </p>
                ) : null}
                <div className="space-y-3">
                  {group.items.map((control) =>
                    renderControl(
                      control,
                      params,
                      baselineParams,
                      profile,
                      onParamsChange,
                    ),
                  )}
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
