export type Genotype = 'AA' | 'Aa' | 'aa'
export type DiseaseCategory = 'hematology'
export type InheritanceMode =
  | 'autosomal-recessive'
  | 'autosomal-dominant'
  | 'x-linked-approx'
  | 'multi-allelic-approx'

export interface GenotypeCounts {
  AA: number
  Aa: number
  aa: number
}

export interface FitnessConfig {
  AA: number
  Aa: number
  aa: number
}

export interface SimulationModifiers {
  malariaPressure: boolean
  heterozygoteAdvantageStrength: number
  carrierPairingBias: number
  consanguinityBoost: number
  endogamyBias: number
}

export interface TreatmentShiftConfig {
  enabled: boolean
  startsAtGeneration: number
  improvedSurvivalAA: number
  improvedFertilityAA: number
}

export interface SimulationParams {
  generations: number
  initialPopulation: number
  initialAlleleFrequency: number
  fixedPopulationSize: boolean
  averageChildrenPerCouple: number
  survivalToReproductiveAge: FitnessConfig
  fertilityMultiplier: FitnessConfig
  modifiers: SimulationModifiers
  treatmentShift: TreatmentShiftConfig
}

export interface GenerationSnapshot {
  generation: number
  population: number
  counts: GenotypeCounts
  alleleFrequencyQ: number
  carrierPrevalence: number
  affectedPrevalence: number
}

export interface ScenarioPreset {
  key: string
  diseaseKey: string
  title: string
  description: string
  params: SimulationParams
}

export interface GenotypeLabelSet {
  AA: string
  Aa: string
  aa: string
}

export interface MetricLabelSet {
  carrierPrevalence: string
  affectedPrevalence: string
}

export interface ParamInfo {
  label: string
  what: string
  reasonable: string
  extremes: string
}

export type ControlKey =
  | 'initialPopulation'
  | 'initialAlleleFrequency'
  | 'carrierPairingBias'
  | 'consanguinityBoost'
  | 'endogamyBias'
  | 'survivalWaa'
  | 'fertilityFaa'
  | 'malariaPressure'
  | 'heterozygoteAdvantageStrength'
  | 'treatmentShiftEnabled'
  | 'generations'
  | 'fixedPopulationSize'
  | 'averageChildrenPerCouple'

export interface DiseaseProfile {
  key: string
  category: DiseaseCategory
  name: string
  shortDescription: string
  inheritanceMode: InheritanceMode
  focusMessage: string
  genotypeLabels: GenotypeLabelSet
  metricLabels?: Partial<MetricLabelSet>
  visibleControls: ControlKey[]
  tooltipOverrides?: Partial<Record<ControlKey, ParamInfo>>
  scenarios: ScenarioPreset[]
}
