import type { Dispatch, ReactNode, SetStateAction } from 'react'
import {
  controlSections,
  controlsForSection,
  type ControlSectionId,
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
  onReset,
  children,
}: {
  title: string
  onReset?: () => void
  children: ReactNode
}) {
  return (
    <section className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </h3>
        {onReset ? (
          <button
            type="button"
            className="rounded border border-slate-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300 hover:border-slate-500 hover:text-slate-100"
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

function LabelWithInfo({ label, info }: { label: string; info: ParamInfo }) {
  return (
    <span className="inline-flex items-center gap-1.5">
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
    case 'survivalWaa':
      return params.survivalToReproductiveAge.aa
    case 'fertilityFaa':
      return params.fertilityMultiplier.aa
    case 'malariaPressure':
      return params.modifiers.malariaPressure
    case 'heterozygoteAdvantageStrength':
      return params.modifiers.heterozygoteAdvantageStrength
    case 'treatmentShiftEnabled':
      return params.treatmentShift.enabled
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
    case 'survivalWaa':
      return {
        ...state,
        survivalToReproductiveAge: {
          ...state.survivalToReproductiveAge,
          aa: Number(value),
        },
      }
    case 'fertilityFaa':
      return {
        ...state,
        fertilityMultiplier: { ...state.fertilityMultiplier, aa: Number(value) },
      }
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

export function ControlPanel({
  params,
  baselineParams,
  profile,
  onParamsChange,
  onReset,
}: ControlPanelProps) {
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
        const sectionControls = controlsForSection(section.id, profile.visibleControls)
        if (sectionControls.length === 0) return null

        return (
          <Section
            key={section.id}
            title={section.title}
            onReset={() => resetSection(section.id)}
          >
            {sectionControls.map((control) => {
              const value = getControlValue(params, control.key)
              const info = profile.tooltipOverrides?.[control.key] ?? control.info

              if (control.inputType === 'toggle') {
                return (
                  <div
                    key={control.key}
                    className="flex items-center justify-between text-xs text-slate-300"
                  >
                    <LabelWithInfo label={control.label} info={info} />
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
                      <LabelWithInfo label={control.label} info={info} />
                    </div>
                    <input
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
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
                    <LabelWithInfo label={control.label} info={info} />
                    <span className="font-mono text-slate-200">{valueText}</span>
                  </div>
                  <input
                    className="w-full accent-indigo-400"
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
            })}
          </Section>
        )
      })}

      <button
        type="button"
        className="mt-4 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700"
        onClick={onReset}
      >
        Reset to selected preset
      </button>
    </div>
  )
}
