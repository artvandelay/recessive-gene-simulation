import type {
  ControlKey,
  DiseaseProfile,
  ScenarioPreset,
  SimulationParams,
} from './types'

function cloneParams(params: SimulationParams): SimulationParams {
  return JSON.parse(JSON.stringify(params)) as SimulationParams
}

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
      startsAtGeneration: 11,
      improvedSurvivalAA: 0.6,
      improvedFertilityAA: 0.55,
    },
  }
}

function makePreset(
  diseaseKey: string,
  key: string,
  title: string,
  description: string,
  params: SimulationParams,
): ScenarioPreset {
  return {
    diseaseKey,
    key,
    title,
    description,
    params: cloneParams(params),
  }
}

const standardControls: ControlKey[] = [
  'initialPopulation',
  'initialAlleleFrequency',
  'carrierPairingBias',
  'consanguinityBoost',
  'endogamyBias',
  'survivalWaa',
  'fertilityFaa',
  'malariaPressure',
  'heterozygoteAdvantageStrength',
  'treatmentShiftEnabled',
  'generations',
  'fixedPopulationSize',
  'averageChildrenPerCouple',
]

const noMalariaControls = standardControls.filter(
  (control) =>
    control !== 'malariaPressure' && control !== 'heterozygoteAdvantageStrength',
)

const noTreatmentControls = standardControls.filter(
  (control) => control !== 'treatmentShiftEnabled',
)

const genericNeutral = makePreset(
  'generic-severe',
  'neutral-recessive',
  'Neutral Recessive',
  'No genotype-specific selection. Allele frequency should stay near-constant.',
  {
    ...baseParams(),
    survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 1 },
    fertilityMultiplier: { AA: 1, Aa: 1, aa: 1 },
  },
)

const genericSevere = makePreset(
  'generic-severe',
  'severe-recessive',
  'Severe Recessive Disease',
  'Strong selection against affected genotype with near-zero fertility.',
  {
    ...baseParams(),
    survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.05 },
    fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.05 },
  },
)

const sickleBalancing = makePreset(
  'sickle-cell',
  'sickle-balancing',
  'Sickle-like Balancing Selection',
  'Malaria pressure favors heterozygotes and sustains a non-zero allele frequency.',
  {
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
)

const thalTreatment = makePreset(
  'beta-thal-major',
  'thal-treatment',
  'Thalassemia + Treatment Improvement',
  'Affected survival and fertility improve after treatment era transition.',
  {
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
)

export const hematDiseaseProfiles: DiseaseProfile[] = [
  {
    key: 'sickle-cell',
    category: 'hematology',
    name: 'Sickle Cell Disease',
    shortDescription:
      'Autosomal recessive hemoglobinopathy where heterozygote advantage can sustain disease alleles.',
    inheritanceMode: 'autosomal-recessive',
    focusMessage:
      'Balancing selection can preserve trait alleles even when severe homozygous disease is selected against.',
    genotypeLabels: {
      AA: 'HbAA (unaffected)',
      Aa: 'HbAS (trait)',
      aa: 'HbSS (disease)',
    },
    visibleControls: noTreatmentControls,
    tooltipOverrides: {
      malariaPressure: {
        label: 'Malaria pressure',
        what: 'Models selective environments where HbAS has a survival edge.',
        reasonable: 'Usually ON for historical endemic malaria scenarios.',
        extremes:
          'If OFF, sickle allele tends to decline under disease burden; if ON with strong advantage, allele persists.',
      },
    },
    scenarios: [
      sickleBalancing,
      makePreset(
        'sickle-cell',
        'sickle-low-malaria',
        'Sickle in Low-Malaria Setting',
        'Carrier advantage weakens and disease allele declines faster.',
        {
          ...baseParams(),
          survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.2 },
          fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.45 },
          modifiers: {
            malariaPressure: true,
            heterozygoteAdvantageStrength: 0.2,
            carrierPairingBias: 0,
            consanguinityBoost: 0,
            endogamyBias: 0,
          },
        },
      ),
    ],
  },
  {
    key: 'beta-thal-major',
    category: 'hematology',
    name: 'Beta-Thalassemia Major',
    shortDescription:
      'Autosomal recessive severe anemia where treatment era transitions shift long-run prevalence.',
    inheritanceMode: 'autosomal-recessive',
    focusMessage:
      'Improved survival and fertility in severe disease can flatten prevalence decline at population scale.',
    genotypeLabels: {
      AA: 'No thal major',
      Aa: 'Beta-thal trait',
      aa: 'Beta-thal major',
    },
    visibleControls: standardControls,
    scenarios: [
      thalTreatment,
      makePreset(
        'beta-thal-major',
        'thal-untreated',
        'Thalassemia Without Treatment Transition',
        'Persistent strong selection drives faster decline of severe genotype.',
        {
          ...baseParams(),
          survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.08 },
          fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.08 },
          treatmentShift: {
            enabled: false,
            startsAtGeneration: 11,
            improvedSurvivalAA: 0.6,
            improvedFertilityAA: 0.55,
          },
        },
      ),
    ],
  },
  {
    key: 'hereditary-spherocytosis',
    category: 'hematology',
    name: 'Hereditary Spherocytosis (Dominant Approx)',
    shortDescription:
      'Autosomal dominant approximation where heterozygotes carry disease burden.',
    inheritanceMode: 'autosomal-dominant',
    focusMessage:
      'Dominant-like burden in heterozygotes changes prevalence dynamics relative to recessive conditions.',
    genotypeLabels: {
      AA: 'No dominant variant',
      Aa: 'Dominant affected (typical)',
      aa: 'Severe dominant burden',
    },
    metricLabels: {
      carrierPrevalence: 'Heterozygous prevalence',
      affectedPrevalence: 'Severe genotype prevalence',
    },
    visibleControls: noMalariaControls,
    scenarios: [
      makePreset(
        'hereditary-spherocytosis',
        'hs-dominant-stable',
        'Dominant Burden with Mild Selection',
        'Heterozygous burden persists when selection is modest.',
        {
          ...baseParams(),
          initialAlleleFrequency: 0.08,
          survivalToReproductiveAge: { AA: 1, Aa: 0.82, aa: 0.45 },
          fertilityMultiplier: { AA: 1, Aa: 0.9, aa: 0.4 },
          treatmentShift: {
            enabled: false,
            startsAtGeneration: 11,
            improvedSurvivalAA: 0.6,
            improvedFertilityAA: 0.55,
          },
        },
      ),
      makePreset(
        'hereditary-spherocytosis',
        'hs-improved-management',
        'Dominant Burden with Care Improvement',
        'Clinical care reduces selection against dominant-affected genotypes over time.',
        {
          ...baseParams(),
          initialAlleleFrequency: 0.08,
          survivalToReproductiveAge: { AA: 1, Aa: 0.82, aa: 0.45 },
          fertilityMultiplier: { AA: 1, Aa: 0.9, aa: 0.4 },
          treatmentShift: {
            enabled: true,
            startsAtGeneration: 12,
            improvedSurvivalAA: 0.7,
            improvedFertilityAA: 0.62,
          },
        },
      ),
    ],
  },
  {
    key: 'g6pd-deficiency',
    category: 'hematology',
    name: 'G6PD Deficiency (X-linked Approx)',
    shortDescription:
      'X-linked recessive dynamics approximated in a one-locus framework for population-scale intuition.',
    inheritanceMode: 'x-linked-approx',
    focusMessage:
      'Sex-linked disorders can show different trait and severe-expression prevalence over time.',
    genotypeLabels: {
      AA: 'No variant',
      Aa: 'Carrier/heterozygous',
      aa: 'High-expression burden',
    },
    metricLabels: {
      carrierPrevalence: 'Carrier-like prevalence',
      affectedPrevalence: 'High-expression prevalence',
    },
    visibleControls: noTreatmentControls,
    scenarios: [
      makePreset(
        'g6pd-deficiency',
        'g6pd-neutral',
        'X-linked Approx, Low Selection',
        'Carrier-like states remain common while high-burden state stays lower.',
        {
          ...baseParams(),
          initialAlleleFrequency: 0.16,
          survivalToReproductiveAge: { AA: 1, Aa: 0.97, aa: 0.78 },
          fertilityMultiplier: { AA: 1, Aa: 0.98, aa: 0.86 },
        },
      ),
      makePreset(
        'g6pd-deficiency',
        'g6pd-malaria-context',
        'X-linked Approx in Malaria Context',
        'Environmental protection can maintain trait-associated variants.',
        {
          ...baseParams(),
          initialAlleleFrequency: 0.16,
          survivalToReproductiveAge: { AA: 0.95, Aa: 1, aa: 0.75 },
          fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.84 },
          modifiers: {
            malariaPressure: true,
            heterozygoteAdvantageStrength: 0.35,
            carrierPairingBias: 0,
            consanguinityBoost: 0,
            endogamyBias: 0,
          },
        },
      ),
    ],
  },
  {
    key: 'hbsc',
    category: 'hematology',
    name: 'HbSC Disease (Multi-allelic Approx)',
    shortDescription:
      'Single-locus multi-allelic approximation using compound heterozygote intuition.',
    inheritanceMode: 'multi-allelic-approx',
    focusMessage:
      'Compound heterozygous states can carry disease burden without classic recessive symmetry.',
    genotypeLabels: {
      AA: 'No HbS/HbC',
      Aa: 'HbSC-like compound',
      aa: 'High-burden homozygous-like',
    },
    metricLabels: {
      carrierPrevalence: 'Compound/trait prevalence',
      affectedPrevalence: 'Severe prevalence',
    },
    visibleControls: standardControls,
    scenarios: [
      makePreset(
        'hbsc',
        'hbsc-moderate-burden',
        'HbSC-like Moderate Burden',
        'Compound heterozygous class carries substantial burden but persists.',
        {
          ...baseParams(),
          initialAlleleFrequency: 0.1,
          survivalToReproductiveAge: { AA: 1, Aa: 0.84, aa: 0.35 },
          fertilityMultiplier: { AA: 1, Aa: 0.88, aa: 0.42 },
          modifiers: {
            malariaPressure: true,
            heterozygoteAdvantageStrength: 0.2,
            carrierPairingBias: 0.02,
            consanguinityBoost: 0,
            endogamyBias: 0,
          },
        },
      ),
      makePreset(
        'hbsc',
        'hbsc-improved-therapy',
        'HbSC-like With Care Improvement',
        'Care improvements reduce selection pressure against higher-burden class.',
        {
          ...baseParams(),
          initialAlleleFrequency: 0.1,
          survivalToReproductiveAge: { AA: 1, Aa: 0.84, aa: 0.35 },
          fertilityMultiplier: { AA: 1, Aa: 0.88, aa: 0.42 },
          modifiers: {
            malariaPressure: true,
            heterozygoteAdvantageStrength: 0.2,
            carrierPairingBias: 0.02,
            consanguinityBoost: 0,
            endogamyBias: 0,
          },
          treatmentShift: {
            enabled: true,
            startsAtGeneration: 12,
            improvedSurvivalAA: 0.65,
            improvedFertilityAA: 0.6,
          },
        },
      ),
    ],
  },
  {
    key: 'generic-severe',
    category: 'hematology',
    name: 'Generic Severe Recessive',
    shortDescription: 'Reference teaching profile for severe autosomal recessive dynamics.',
    inheritanceMode: 'autosomal-recessive',
    focusMessage:
      'Use this profile as a clean baseline before switching to disease-specific hemat contexts.',
    genotypeLabels: {
      AA: 'Unaffected',
      Aa: 'Carrier',
      aa: 'Affected',
    },
    visibleControls: standardControls,
    scenarios: [genericNeutral, genericSevere],
  },
]

export const defaultDiseaseKey = 'sickle-cell'
export const defaultPresetKey = 'sickle-balancing'
