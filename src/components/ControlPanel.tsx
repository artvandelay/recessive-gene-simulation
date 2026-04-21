import type { Dispatch, ReactNode, SetStateAction } from 'react'
import type { SimulationParams } from '../sim/types'

interface ControlPanelProps {
  params: SimulationParams
  baselineParams: SimulationParams
  onParamsChange: Dispatch<SetStateAction<SimulationParams>>
  onReset: () => void
}

interface ParamInfo {
  label: string
  what: string
  reasonable: string
  extremes: string
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

function SliderRow({
  label,
  info,
  value,
  min,
  max,
  step,
  formatValue,
  onChange,
}: {
  label: string
  info: ParamInfo
  value: number
  min: number
  max: number
  step: number
  formatValue?: (value: number) => string
  onChange: (value: number) => void
}) {
  return (
    <div className="block">
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <LabelWithInfo label={label} info={info} />
        <span className="font-mono text-slate-200">
          {formatValue ? formatValue(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        className="w-full accent-indigo-400"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

function NumberRow({
  label,
  info,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  info: ParamInfo
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="block text-xs text-slate-300">
      <div className="mb-1">
        <LabelWithInfo label={label} info={info} />
      </div>
      <input
        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}

function ToggleRow({
  label,
  info,
  checked,
  onChange,
}: {
  label: string
  info: ParamInfo
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-300">
      <LabelWithInfo label={label} info={info} />
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  )
}

export function ControlPanel({
  params,
  baselineParams,
  onParamsChange,
  onReset,
}: ControlPanelProps) {
  const resetInitialPopulation = () =>
    onParamsChange((prev) => ({
      ...prev,
      initialPopulation: baselineParams.initialPopulation,
      initialAlleleFrequency: baselineParams.initialAlleleFrequency,
    }))

  const resetMatingStructure = () =>
    onParamsChange((prev) => ({
      ...prev,
      modifiers: {
        ...prev.modifiers,
        carrierPairingBias: baselineParams.modifiers.carrierPairingBias,
        consanguinityBoost: baselineParams.modifiers.consanguinityBoost,
        endogamyBias: baselineParams.modifiers.endogamyBias,
      },
    }))

  const resetSelectionFitness = () =>
    onParamsChange((prev) => ({
      ...prev,
      survivalToReproductiveAge: {
        ...prev.survivalToReproductiveAge,
        aa: baselineParams.survivalToReproductiveAge.aa,
      },
      fertilityMultiplier: {
        ...prev.fertilityMultiplier,
        aa: baselineParams.fertilityMultiplier.aa,
      },
    }))

  const resetEnvironment = () =>
    onParamsChange((prev) => ({
      ...prev,
      modifiers: {
        ...prev.modifiers,
        malariaPressure: baselineParams.modifiers.malariaPressure,
        heterozygoteAdvantageStrength:
          baselineParams.modifiers.heterozygoteAdvantageStrength,
      },
      treatmentShift: {
        ...prev.treatmentShift,
        enabled: baselineParams.treatmentShift.enabled,
      },
    }))

  const resetSimulationControls = () =>
    onParamsChange((prev) => ({
      ...prev,
      generations: baselineParams.generations,
      fixedPopulationSize: baselineParams.fixedPopulationSize,
      averageChildrenPerCouple: baselineParams.averageChildrenPerCouple,
    }))

  return (
    <div className="mt-4">
      <Section title="Initial Population" onReset={resetInitialPopulation}>
        <NumberRow
          label="Population size"
          info={{
            label: 'Population size',
            what: 'The total number of individuals represented in each generation.',
            reasonable:
              'Use about 800-10,000 for stable curves and quick interaction.',
            extremes:
              'Very low values exaggerate random-looking jumps; very high values smooth dynamics but can feel less intuitive.',
          }}
          value={params.initialPopulation}
          min={200}
          max={100000}
          step={50}
          onChange={(value) =>
            onParamsChange((prev) => ({
              ...prev,
              initialPopulation: value,
            }))
          }
        />
        <SliderRow
          label="Initial allele frequency (q)"
          info={{
            label: 'Initial allele frequency (q)',
            what: 'Starting fraction of recessive alleles in the gene pool.',
            reasonable: 'For severe disorders, 0.03-0.20 is useful for teaching.',
            extremes:
              'Near 0 means affected births are initially rare; near 0.5 makes affected prevalence very high at baseline.',
          }}
          value={params.initialAlleleFrequency}
          min={0.01}
          max={0.45}
          step={0.01}
          formatValue={(value) => value.toFixed(2)}
          onChange={(value) =>
            onParamsChange((prev) => ({ ...prev, initialAlleleFrequency: value }))
          }
        />
      </Section>

      <Section title="Mating Structure" onReset={resetMatingStructure}>
        <SliderRow
          label="Carrier x carrier pairing bias"
          info={{
            label: 'Carrier x carrier pairing bias',
            what: 'Extra tendency for carriers to partner with other carriers beyond random mixing.',
            reasonable: 'Keep around 0.00-0.25 unless modeling strong assortative structure.',
            extremes:
              'At 0, pairing is close to random; at very high values, aa births increase faster because carrier pairings are concentrated.',
          }}
          value={params.modifiers.carrierPairingBias}
          min={0}
          max={0.9}
          step={0.01}
          onChange={(value) =>
            onParamsChange((prev) => ({
              ...prev,
              modifiers: { ...prev.modifiers, carrierPairingBias: value },
            }))
          }
        />
        <SliderRow
          label="Consanguinity-like boost"
          info={{
            label: 'Consanguinity-like boost',
            what: 'Additional uplift in related or genetically similar pairings.',
            reasonable: 'About 0.00-0.20 for mild to moderate effects.',
            extremes:
              'Near 0 has little impact; high values push homozygosity up and can temporarily raise affected prevalence.',
          }}
          value={params.modifiers.consanguinityBoost}
          min={0}
          max={0.6}
          step={0.01}
          onChange={(value) =>
            onParamsChange((prev) => ({
              ...prev,
              modifiers: { ...prev.modifiers, consanguinityBoost: value },
            }))
          }
        />
        <SliderRow
          label="Endogamy (homozygosity pressure)"
          info={{
            label: 'Endogamy (homozygosity pressure)',
            what: 'Inbreeding-like pressure that shifts genotype frequencies toward homozygous states.',
            reasonable: 'Usually 0.00-0.30 for realistic educational scenarios.',
            extremes:
              'At 0 the model stays near Hardy-Weinberg mixing; higher values reduce heterozygotes and increase both AA and aa.',
          }}
          value={params.modifiers.endogamyBias}
          min={0}
          max={0.8}
          step={0.01}
          onChange={(value) =>
            onParamsChange((prev) => ({
              ...prev,
              modifiers: { ...prev.modifiers, endogamyBias: value },
            }))
          }
        />
      </Section>

      <Section title="Selection / Fitness" onReset={resetSelectionFitness}>
        <SliderRow
          label="Survival w_aa"
          info={{
            label: 'Survival w_aa',
            what: 'Relative survival of affected genotype to reproductive age.',
            reasonable: 'Around 0.05-0.70, depending on disease severity and care level.',
            extremes:
              'Near 0 gives strong purifying selection against aa; near 1 means little survival disadvantage.',
          }}
          value={params.survivalToReproductiveAge.aa}
          min={0.01}
          max={1.2}
          step={0.01}
          onChange={(value) =>
            onParamsChange((prev) => ({
              ...prev,
              survivalToReproductiveAge: {
                ...prev.survivalToReproductiveAge,
                aa: value,
              },
            }))
          }
        />
        <SliderRow
          label="Fertility f_aa"
          info={{
            label: 'Fertility f_aa',
            what: 'Relative reproductive output of affected individuals who survive.',
            reasonable: 'Around 0.05-0.80 in most teaching scenarios.',
            extremes:
              'Very low values accelerate decline of aa lineages; values near or above 1 imply little or no fertility penalty.',
          }}
          value={params.fertilityMultiplier.aa}
          min={0.01}
          max={1.2}
          step={0.01}
          onChange={(value) =>
            onParamsChange((prev) => ({
              ...prev,
              fertilityMultiplier: {
                ...prev.fertilityMultiplier,
                aa: value,
              },
            }))
          }
        />
      </Section>

      <Section title="Environment / Disease Mode" onReset={resetEnvironment}>
        <ToggleRow
          label="Malaria pressure (heterozygote advantage)"
          info={{
            label: 'Malaria pressure',
            what: 'Turns on a context where carriers have a survival advantage over both homozygous groups.',
            reasonable:
              'Use ON for sickle-like balancing-selection demos and OFF otherwise.',
            extremes:
              'OFF behaves like ordinary selection settings; ON can maintain a non-zero disease allele equilibrium.',
          }}
          checked={params.modifiers.malariaPressure}
          onChange={(checked) =>
            onParamsChange((prev) => ({
              ...prev,
              modifiers: {
                ...prev.modifiers,
                malariaPressure: checked,
              },
            }))
          }
        />
        <SliderRow
          label="Advantage strength"
          info={{
            label: 'Advantage strength',
            what: 'How strongly the heterozygote survival bonus is applied when malaria pressure is enabled.',
            reasonable:
              'Try 0.20-0.70 for visible but interpretable balancing dynamics.',
            extremes:
              'Near 0 gives weak balancing effects; near 1 strongly favors carriers and can hold q substantially above zero.',
          }}
          value={params.modifiers.heterozygoteAdvantageStrength}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) =>
            onParamsChange((prev) => ({
              ...prev,
              modifiers: { ...prev.modifiers, heterozygoteAdvantageStrength: value },
            }))
          }
        />
        <ToggleRow
          label="Treatment-era improvement"
          info={{
            label: 'Treatment-era improvement',
            what: 'Applies a step-change that improves affected survival and fertility after a configured generation.',
            reasonable:
              'Enable when teaching modern-care scenarios and compare against untreated trajectories.',
            extremes:
              'Disabled keeps constant selection pressure; enabled can flatten declines and maintain higher long-run affected prevalence.',
          }}
          checked={params.treatmentShift.enabled}
          onChange={(checked) =>
            onParamsChange((prev) => ({
              ...prev,
              treatmentShift: {
                ...prev.treatmentShift,
                enabled: checked,
              },
            }))
          }
        />
      </Section>

      <Section title="Simulation Controls" onReset={resetSimulationControls}>
        <NumberRow
          label="Generations"
          info={{
            label: 'Generations',
            what: 'How many discrete generational updates the simulation computes.',
            reasonable: 'Use 40-120 for smooth trajectories without over-long runs.',
            extremes:
              'Low values show short-term transitions only; high values reveal long-run equilibrium behavior.',
          }}
          value={params.generations}
          min={20}
          max={300}
          step={1}
          onChange={(value) =>
            onParamsChange((prev) => ({
              ...prev,
              generations: value,
            }))
          }
        />

        <ToggleRow
          label="Fixed population size"
          info={{
            label: 'Fixed population size',
            what: 'If enabled, N is held constant each generation; otherwise N changes with reproductive output.',
            reasonable:
              'Keep ON for clean genotype-frequency teaching; OFF for demographic feedback scenarios.',
            extremes:
              'ON isolates genetics from demography; OFF can amplify selection effects through shrinking or growing population size.',
          }}
          checked={params.fixedPopulationSize}
          onChange={(checked) =>
            onParamsChange((prev) => ({
              ...prev,
              fixedPopulationSize: checked,
            }))
          }
        />

        <SliderRow
          label="Average children per couple"
          info={{
            label: 'Average children per couple',
            what: 'Expected births per reproductive pair, used when variable population mode is enabled.',
            reasonable: 'About 1.6-2.8 for most realistic demos.',
            extremes:
              'Below ~2 can shrink population over time; much higher values drive rapid growth and can mask subtle frequency effects.',
          }}
          value={params.averageChildrenPerCouple}
          min={0.5}
          max={4.5}
          step={0.1}
          formatValue={(value) => value.toFixed(1)}
          onChange={(value) =>
            onParamsChange((prev) => ({ ...prev, averageChildrenPerCouple: value }))
          }
        />

        <button
          type="button"
          className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700"
          onClick={onReset}
        >
          Reset to selected preset
        </button>
      </Section>
    </div>
  )
}
