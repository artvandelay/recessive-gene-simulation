import type { ControlKey, ParamInfo } from './types'

export type ControlSectionId =
  | 'populationSetup'
  | 'matingStructure'
  | 'naturalSelection'
  | 'environmentalForces'
  | 'treatmentEra'
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
  /**
   * Key of the boolean control that must be ON for this control to appear.
   * Used for conditionally-visible sub-parameters (e.g. treatment sub-knobs).
   */
  requiresControl?: ControlKey
  /**
   * Optional short sub-group label within a section. Controls sharing the
   * same group render under a single heading (e.g. "Genotype survival").
   */
  group?: string
}

export const controlSections: Array<{
  id: ControlSectionId
  title: string
  caption?: string
}> = [
  {
    id: 'populationSetup',
    title: 'Population Setup',
    caption: 'Who lives in this population to start with?',
  },
  {
    id: 'matingStructure',
    title: 'Mating & Drift Forces',
    caption: 'How do people pair up? Small or structured populations drift.',
  },
  {
    id: 'naturalSelection',
    title: 'Natural Selection',
    caption:
      'Who survives to reproduce, and how many offspring do they have?',
  },
  {
    id: 'environmentalForces',
    title: 'Environmental Forces',
    caption: 'External pressures and mutation: the forces that push q around.',
  },
  {
    id: 'treatmentEra',
    title: 'Treatment Era',
    caption: 'Step-change in clinical care that rescues affected individuals.',
  },
  {
    id: 'simulationControls',
    title: 'Simulation Settings',
    caption: 'Time horizon and demographic accounting.',
  },
]

export const controlSpecs: Record<ControlKey, ControlSpec> = {
  initialPopulation: {
    key: 'initialPopulation',
    section: 'populationSetup',
    inputType: 'number',
    label: 'Population size (N)',
    min: 50,
    max: 100000,
    step: 50,
    valueDecimals: 0,
    info: {
      label: 'Population size (N)',
      what: 'Total individuals represented in each generation.',
      reasonable: '800-10,000 for stable curves; try 100-300 to feel drift.',
      extremes:
        'Small N magnifies random-looking swings; huge N smooths everything out.',
    },
  },
  initialAlleleFrequency: {
    key: 'initialAlleleFrequency',
    section: 'populationSetup',
    inputType: 'slider',
    label: 'Initial allele frequency (q)',
    min: 0.01,
    max: 0.5,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Initial allele frequency (q)',
      what: 'Starting fraction of disease alleles in the gene pool.',
      reasonable: 'For hemat disorders, 0.03-0.20 is typical.',
      extremes:
        'Near 0, affected genotypes are initially rare; near 0.5 starts with high homozygous burden.',
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
      what: 'Extra tendency for heterozygotes to partner with each other.',
      reasonable: '0.00-0.25 unless modeling strong assortative structure.',
      extremes:
        'At 0, mating is random; high values spike affected births via Aa x Aa matings.',
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
      reasonable: '0.00-0.20 for mild to moderate effects.',
      extremes:
        'Near 0 has little impact; high values raise homozygosity and disease burden.',
    },
  },
  endogamyBias: {
    key: 'endogamyBias',
    section: 'matingStructure',
    inputType: 'slider',
    label: 'Endogamy (F, homozygosity pressure)',
    min: 0,
    max: 0.8,
    step: 0.01,
    valueDecimals: 2,
    info: {
      label: 'Endogamy (inbreeding coefficient)',
      what: 'Inbreeding-like blend that shifts genotypes toward homozygous states.',
      reasonable: '0.00-0.30 for realistic scenarios.',
      extremes:
        'At 0 the model stays near Hardy-Weinberg; high values reduce heterozygotes.',
    },
  },

  survivalWAA: {
    key: 'survivalWAA',
    section: 'naturalSelection',
    inputType: 'slider',
    label: 'Survival w_AA',
    min: 0.01,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    group: 'Genotype survival to reproductive age',
    info: {
      label: 'Survival w_AA',
      what: 'Relative survival of homozygous unaffected individuals.',
      reasonable: 'Usually 1.0. Reduce to model AA vulnerability (e.g. malaria on AA).',
      extremes: 'Below 1 creates selection against AA, inverting classical dynamics.',
    },
  },
  survivalWAa: {
    key: 'survivalWAa',
    section: 'naturalSelection',
    inputType: 'slider',
    label: 'Survival w_Aa',
    min: 0.01,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    group: 'Genotype survival to reproductive age',
    info: {
      label: 'Survival w_Aa',
      what: 'Relative survival of heterozygous carriers.',
      reasonable: 'Usually 1.0 for recessive disease; above 1 for heterozygote advantage.',
      extremes:
        'w_Aa > w_AA and w_Aa > w_aa gives balancing (overdominant) selection.',
    },
  },
  survivalWaa: {
    key: 'survivalWaa',
    section: 'naturalSelection',
    inputType: 'slider',
    label: 'Survival w_aa',
    min: 0.01,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    group: 'Genotype survival to reproductive age',
    info: {
      label: 'Survival w_aa',
      what: 'Relative survival of the high-burden homozygous genotype.',
      reasonable: '0.05-0.70 depending on severity and care.',
      extremes:
        'Near 0 gives strong purifying selection; near 1 removes the survival penalty.',
    },
  },
  fertilityFAA: {
    key: 'fertilityFAA',
    section: 'naturalSelection',
    inputType: 'slider',
    label: 'Fertility f_AA',
    min: 0.01,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    group: 'Genotype fertility multiplier',
    info: {
      label: 'Fertility f_AA',
      what: 'Relative reproductive output of unaffected homozygotes.',
      reasonable: 'Usually 1.0.',
      extremes: 'Low values invert the usual fitness ordering.',
    },
  },
  fertilityFAa: {
    key: 'fertilityFAa',
    section: 'naturalSelection',
    inputType: 'slider',
    label: 'Fertility f_Aa',
    min: 0.01,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    group: 'Genotype fertility multiplier',
    info: {
      label: 'Fertility f_Aa',
      what: 'Relative reproductive output of carriers.',
      reasonable: 'Usually near 1.0; lower for dominant-style burden.',
      extremes:
        'Below 1 models carrier fitness cost (relevant for dominant approximations).',
    },
  },
  fertilityFaa: {
    key: 'fertilityFaa',
    section: 'naturalSelection',
    inputType: 'slider',
    label: 'Fertility f_aa',
    min: 0.01,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    group: 'Genotype fertility multiplier',
    info: {
      label: 'Fertility f_aa',
      what: 'Relative reproductive output of high-burden individuals.',
      reasonable: '0.05-0.80 in most teaching scenarios.',
      extremes:
        'Very low values accelerate decline; near 1 implies weak fertility penalty.',
    },
  },

  malariaPressure: {
    key: 'malariaPressure',
    section: 'environmentalForces',
    inputType: 'toggle',
    label: 'Malaria pressure (heterozygote advantage)',
    group: 'Environmental pressure',
    info: {
      label: 'Malaria pressure',
      what: 'Turns on an environment where heterozygotes have a survival edge.',
      reasonable: 'ON for sickle-like balancing demos, OFF otherwise.',
      extremes:
        'ON can maintain non-zero disease-allele equilibria; OFF behaves like plain selection.',
    },
  },
  heterozygoteAdvantageStrength: {
    key: 'heterozygoteAdvantageStrength',
    section: 'environmentalForces',
    inputType: 'slider',
    label: 'Advantage strength (s)',
    min: 0,
    max: 1,
    step: 0.01,
    valueDecimals: 2,
    group: 'Environmental pressure',
    requiresControl: 'malariaPressure',
    info: {
      label: 'Heterozygote advantage strength',
      what: 'How strongly malaria boosts Aa survival (and penalises AA, aa) when ON.',
      reasonable: '0.20-0.70 for visible but interpretable balancing dynamics.',
      extremes:
        'Near 0 gives weak balancing; near 1 strongly favors heterozygotes.',
    },
  },
  mutationRate: {
    key: 'mutationRate',
    section: 'environmentalForces',
    inputType: 'slider',
    label: 'Mutation rate (mu, per allele per gen)',
    min: 0,
    max: 0.01,
    step: 0.0001,
    valueDecimals: 4,
    group: 'Mutation',
    info: {
      label: 'Mutation rate mu',
      what: 'Symmetric per-allele mutation each generation: q_new = q*(1-mu) + (1-q)*mu.',
      reasonable: '0 to 0.0010. Real biology is near 1e-5 to 1e-4; 0.001 is teaching-scale.',
      extremes:
        'At 0 the allele can go extinct under selection; with mu > 0 an equilibrium exists (mutation-selection balance).',
    },
  },

  treatmentShiftEnabled: {
    key: 'treatmentShiftEnabled',
    section: 'treatmentEra',
    inputType: 'toggle',
    label: 'Enable treatment-era improvement',
    info: {
      label: 'Treatment-era improvement',
      what: 'Applies a step-change in affected survival/fertility after a chosen generation.',
      reasonable: 'Enable when teaching modern-care scenarios.',
      extremes:
        'Disabled keeps constant selection; enabled can flatten decline and raise long-run prevalence.',
    },
  },
  treatmentStartGeneration: {
    key: 'treatmentStartGeneration',
    section: 'treatmentEra',
    inputType: 'number',
    label: 'Treatment starts at generation',
    min: 0,
    max: 300,
    step: 1,
    valueDecimals: 0,
    requiresControl: 'treatmentShiftEnabled',
    info: {
      label: 'Treatment start generation',
      what: 'Generation index where improved care begins.',
      reasonable: '8-20 so students see both before and after eras.',
      extremes:
        'Very early = no baseline visible; very late = no visible effect within horizon.',
    },
  },
  treatmentImprovedSurvival: {
    key: 'treatmentImprovedSurvival',
    section: 'treatmentEra',
    inputType: 'slider',
    label: 'Post-treatment w_aa',
    min: 0.05,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    requiresControl: 'treatmentShiftEnabled',
    info: {
      label: 'Post-treatment affected survival',
      what: 'Survival of affected individuals after treatment era begins.',
      reasonable: '0.5-0.9 for realistic modern-care impact.',
      extremes:
        'Near the baseline w_aa gives no effect; near 1 fully rescues the aa class.',
    },
  },
  treatmentImprovedFertility: {
    key: 'treatmentImprovedFertility',
    section: 'treatmentEra',
    inputType: 'slider',
    label: 'Post-treatment f_aa',
    min: 0.05,
    max: 1.2,
    step: 0.01,
    valueDecimals: 2,
    requiresControl: 'treatmentShiftEnabled',
    info: {
      label: 'Post-treatment affected fertility',
      what: 'Fertility of affected individuals after treatment era begins.',
      reasonable: '0.4-0.9.',
      extremes:
        'Low = treatment only rescues survival; high = affected reproduce like unaffected.',
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
      what: 'How many discrete generational updates to compute.',
      reasonable: '40-120 for smooth trajectories.',
      extremes:
        'Low = short-term transitions only; high = long-run equilibrium behavior.',
    },
  },
  fixedPopulationSize: {
    key: 'fixedPopulationSize',
    section: 'simulationControls',
    inputType: 'toggle',
    label: 'Fixed population size',
    info: {
      label: 'Fixed population size',
      what: 'If ON, N is held constant; otherwise N tracks reproductive output.',
      reasonable: 'ON for clean genotype-frequency teaching; OFF for demographic feedback.',
      extremes:
        'ON isolates genetics from demography; OFF can amplify selection via shrinking/growing populations.',
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
      what: 'Expected births per reproductive pair (variable-N mode only).',
      reasonable: '1.6-2.8 for most demos.',
      extremes:
        'Below ~2 shrinks populations; much higher drives rapid growth.',
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
