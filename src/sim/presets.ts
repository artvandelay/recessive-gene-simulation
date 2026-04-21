import type { ScenarioPreset, SimulationParams } from './types'

function baseParams(): SimulationParams {
  return {
    generations: 80,
    initialPopulation: 1200,
    initialAlleleFrequency: 0.12,
    fixedPopulationSize: true,
    averageChildrenPerCouple: 2.1,
    survivalToReproductiveAge: {
      AA: 1,
      Aa: 1,
      aa: 0.1,
    },
    fertilityMultiplier: {
      AA: 1,
      Aa: 1,
      aa: 0.2,
    },
    modifiers: {
      malariaPressure: false,
      heterozygoteAdvantageStrength: 0,
      carrierPairingBias: 0,
      consanguinityBoost: 0,
      endogamyBias: 0,
    },
    treatmentShift: {
      enabled: false,
      startsAtGeneration: 10,
      improvedSurvivalAA: 0.6,
      improvedFertilityAA: 0.55,
    },
  }
}

export const presets: ScenarioPreset[] = [
  {
    key: 'neutral-recessive',
    title: 'Neutral Recessive',
    description:
      'No genotype-specific selection. Allele frequency should stay near-constant.',
    params: {
      ...baseParams(),
      survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 1 },
      fertilityMultiplier: { AA: 1, Aa: 1, aa: 1 },
    },
  },
  {
    key: 'severe-recessive',
    title: 'Severe Recessive Disease',
    description:
      'Strong selection against affected genotype with near-zero fertility.',
    params: {
      ...baseParams(),
      survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.05 },
      fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.05 },
    },
  },
  {
    key: 'sickle-balancing',
    title: 'Sickle-like Balancing Selection',
    description:
      'Malaria pressure favors heterozygotes and sustains a non-zero allele frequency.',
    params: {
      ...baseParams(),
      survivalToReproductiveAge: { AA: 0.9, Aa: 1, aa: 0.2 },
      fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.55 },
      modifiers: {
        malariaPressure: true,
        heterozygoteAdvantageStrength: 0.65,
        carrierPairingBias: 0,
        consanguinityBoost: 0,
        endogamyBias: 0,
      },
    },
  },
  {
    key: 'thal-treatment',
    title: 'Thalassemia + Treatment Improvement',
    description:
      'Affected survival and fertility improve after treatment era transition.',
    params: {
      ...baseParams(),
      survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.1 },
      fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.12 },
      treatmentShift: {
        enabled: true,
        startsAtGeneration: 11,
        improvedSurvivalAA: 0.6,
        improvedFertilityAA: 0.55,
      },
    },
  },
]

export const defaultPreset = presets[1]
