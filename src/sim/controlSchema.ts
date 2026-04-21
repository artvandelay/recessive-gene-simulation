import type { ControlKey, ParamInfo } from './types'

export type ControlSectionId =
  | 'initialPopulation'
  | 'matingStructure'
  | 'selectionFitness'
  | 'environmentMode'
  | 'simulationControls'

export interface ControlSpec {
  key: ControlKey
  section: ControlSectionId
  inputType: 'number' | 'slider' | 'toggle'
  label: string
  min?: number
  max?: number
  step?: number
  valueDecimals?: number
  info: ParamInfo
}

export const controlSections: Array<{ id: ControlSectionId; title: string }> = [
  { id: 'initialPopulation', title: 'Initial Population' },
  { id: 'matingStructure', title: 'Mating Structure' },
  { id: 'selectionFitness', title: 'Selection / Fitness' },
  { id: 'environmentMode', title: 'Environment / Disease Mode' },
  { id: 'simulationControls', title: 'Simulation Controls' },
]

export const controlSpecs: Record<ControlKey, ControlSpec> = {
  initialPopulation: {
    key: 'initialPopulation',
    section: 'initialPopulation',
    inputType: 'number',
    label: 'Population size',
    min: 200,
    max: 100000,
    step: 50,
    valueDecimals: 0,
    info: {
      label: 'Population size',
      what: 'The total number of individuals represented in each generation.',
      reasonable: 'Use about 800-10,000 for stable curves and quick interaction.',
      extremes:
        'Very low values exaggerate random-looking jumps; very high values smooth dynamics but can feel less intuitive.',
    },
  },
  initialAlleleFrequency: {
    key: 'initialAlleleFrequency',
    section: 'initialPopulation',
    inputType: 'slider',
    label: 'Initial allele frequency (q)',
    min: 0.01,
    max: 0.45,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Initial allele frequency (q)',
      what: 'Starting fraction of modeled disease alleles in the gene pool.',
      reasonable: 'For many severe hemat disorders, 0.03-0.20 is useful for teaching.',
      extremes:
        'Near 0 means disease-associated genotypes are initially rare; near 0.5 starts with high homozygous burden.',
    },
  },
  carrierPairingBias: {
    key: 'carrierPairingBias',
    section: 'matingStructure',
    inputType: 'slider',
    label: 'Carrier x carrier pairing bias',
    min: 0,
    max: 0.9,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Carrier x carrier pairing bias',
      what: 'Extra tendency for trait-like heterozygotes to partner with each other beyond random mixing.',
      reasonable: 'Keep around 0.00-0.25 unless modeling strong assortative structure.',
      extremes:
        'At 0, pairing is close to random; at high values, homozygous affected births can rise faster.',
    },
  },
  consanguinityBoost: {
    key: 'consanguinityBoost',
    section: 'matingStructure',
    inputType: 'slider',
    label: 'Consanguinity-like boost',
    min: 0,
    max: 0.6,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Consanguinity-like boost',
      what: 'Additional uplift in genetically similar pairings.',
      reasonable: 'About 0.00-0.20 for mild to moderate effects.',
      extremes:
        'Near 0 has little impact; high values push homozygosity up and can increase disease burden.',
    },
  },
  endogamyBias: {
    key: 'endogamyBias',
    section: 'matingStructure',
    inputType: 'slider',
    label: 'Endogamy (homozygosity pressure)',
    min: 0,
    max: 0.8,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Endogamy (homozygosity pressure)',
      what: 'Inbreeding-like pressure that shifts genotype frequencies toward homozygous states.',
      reasonable: 'Usually 0.00-0.30 for realistic educational scenarios.',
      extremes:
        'At 0 the model stays near Hardy-Weinberg mixing; higher values reduce heterozygotes and raise homozygote classes.',
    },
  },
  survivalWaa: {
    key: 'survivalWaa',
    section: 'selectionFitness',
    inputType: 'slider',
    label: 'Survival w_aa',
    min: 0.01,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Survival w_aa',
      what: 'Relative survival of the modeled high-burden genotype to reproductive age.',
      reasonable: 'Around 0.05-0.70, depending on disease severity and care level.',
      extremes:
        'Near 0 gives strong purifying selection; near 1 means little survival disadvantage.',
    },
  },
  fertilityFaa: {
    key: 'fertilityFaa',
    section: 'selectionFitness',
    inputType: 'slider',
    label: 'Fertility f_aa',
    min: 0.01,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Fertility f_aa',
      what: 'Relative reproductive output of affected/high-burden individuals who survive.',
      reasonable: 'Around 0.05-0.80 in most teaching scenarios.',
      extremes:
        'Very low values accelerate decline of high-burden genotypes; values near 1 imply weak fertility penalty.',
    },
  },
  malariaPressure: {
    key: 'malariaPressure',
    section: 'environmentMode',
    inputType: 'toggle',
    label: 'Malaria pressure (heterozygote advantage)',
    info: {
      label: 'Malaria pressure',
      what: 'Turns on a context where heterozygotes can have a survival advantage.',
      reasonable: 'Use ON for sickle-like balancing-selection demonstrations and OFF otherwise.',
      extremes:
        'OFF behaves like ordinary selection settings; ON can maintain non-zero disease-allele equilibria.',
    },
  },
  heterozygoteAdvantageStrength: {
    key: 'heterozygoteAdvantageStrength',
    section: 'environmentMode',
    inputType: 'slider',
    label: 'Advantage strength',
    min: 0,
    max: 1,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Advantage strength',
      what: 'How strongly the heterozygote survival bonus is applied when malaria pressure is on.',
      reasonable: 'Try 0.20-0.70 for visible but interpretable balancing dynamics.',
      extremes:
        'Near 0 gives weak balancing effects; near 1 strongly favors heterozygotes.',
    },
  },
  treatmentShiftEnabled: {
    key: 'treatmentShiftEnabled',
    section: 'environmentMode',
    inputType: 'toggle',
    label: 'Treatment-era improvement',
    info: {
      label: 'Treatment-era improvement',
      what: 'Applies a step-change that improves survival/fertility in high-burden genotype after a chosen era.',
      reasonable: 'Enable when teaching modern-care scenarios and compare against untreated trajectories.',
      extremes:
        'Disabled keeps constant selection pressure; enabled can flatten decline and raise long-run prevalence.',
    },
  },
  generations: {
    key: 'generations',
    section: 'simulationControls',
    inputType: 'number',
    label: 'Generations',
    min: 20,
    max: 300,
    step: 1,
    valueDecimals: 0,
    info: {
      label: 'Generations',
      what: 'How many discrete generational updates the simulation computes.',
      reasonable: 'Use 40-120 for smooth trajectories without over-long runs.',
      extremes:
        'Low values show short-term transitions only; high values reveal long-run equilibrium behavior.',
    },
  },
  fixedPopulationSize: {
    key: 'fixedPopulationSize',
    section: 'simulationControls',
    inputType: 'toggle',
    label: 'Fixed population size',
    info: {
      label: 'Fixed population size',
      what: 'If enabled, N is held constant each generation; otherwise N changes with reproductive output.',
      reasonable:
        'Keep ON for clean genotype-frequency teaching; OFF for demographic feedback scenarios.',
      extremes:
        'ON isolates genetics from demography; OFF can amplify selection effects through shrinking or growing populations.',
    },
  },
  averageChildrenPerCouple: {
    key: 'averageChildrenPerCouple',
    section: 'simulationControls',
    inputType: 'slider',
    label: 'Average children per couple',
    min: 0.5,
    max: 4.5,
    step: 0.1,
    valueDecimals: 1,
    info: {
      label: 'Average children per couple',
      what: 'Expected births per reproductive pair, used when variable population mode is enabled.',
      reasonable: 'About 1.6-2.8 for most realistic demos.',
      extremes:
        'Below ~2 can shrink populations over time; much higher values drive rapid growth.',
    },
  },
}

export function controlsForSection(
  section: ControlSectionId,
  visibleControls: ControlKey[],
): ControlSpec[] {
  const visible = new Set(visibleControls)
  return Object.values(controlSpecs).filter(
    (spec) => spec.section === section && visible.has(spec.key),
  )
}
