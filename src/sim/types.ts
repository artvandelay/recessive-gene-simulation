export type Genotype = 'AA' | 'Aa' | 'aa'

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
  title: string
  description: string
  params: SimulationParams
}
