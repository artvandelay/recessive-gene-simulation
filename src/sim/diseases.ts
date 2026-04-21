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
    mutationRate: 0,
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
  highlights: string[],
  params: SimulationParams,
): ScenarioPreset {
  return {
    diseaseKey,
    key,
    title,
    description,
    highlights,
    params: cloneParams(params),
  }
}

/**
 * Full control set shared by most profiles. A profile's `visibleControls`
 * should be derived from this by subtracting controls that don't apply to
 * the biology (e.g. malaria for hereditary spherocytosis).
 */
const fullControls: ControlKey[] = [
  'initialPopulation',
  'initialAlleleFrequency',
  'carrierPairingBias',
  'consanguinityBoost',
  'endogamyBias',
  'survivalWAA',
  'survivalWAa',
  'survivalWaa',
  'fertilityFAA',
  'fertilityFAa',
  'fertilityFaa',
  'mutationRate',
  'malariaPressure',
  'heterozygoteAdvantageStrength',
  'treatmentShiftEnabled',
  'treatmentStartGeneration',
  'treatmentImprovedSurvival',
  'treatmentImprovedFertility',
  'generations',
  'fixedPopulationSize',
  'averageChildrenPerCouple',
]

const withoutMalaria: ControlKey[] = fullControls.filter(
  (control) =>
    control !== 'malariaPressure' && control !== 'heterozygoteAdvantageStrength',
)

const withoutTreatment: ControlKey[] = fullControls.filter(
  (control) =>
    control !== 'treatmentShiftEnabled' &&
    control !== 'treatmentStartGeneration' &&
    control !== 'treatmentImprovedSurvival' &&
    control !== 'treatmentImprovedFertility',
)

// ---------------------------------------------------------------------------
// Presets exported by key (used by tests)
// ---------------------------------------------------------------------------

const genericNeutral = makePreset(
  'generic-severe',
  'neutral-recessive',
  'Neutral Recessive',
  'No genotype-specific selection. Allele frequency drifts only if N is small.',
  ['Selection OFF', 'No malaria', 'Mutation OFF'],
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
  ['Strong selection on aa', 'No malaria', 'No treatment'],
  {
    ...baseParams(),
    survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.05 },
    fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.05 },
  },
)

const genericMutationBalance = makePreset(
  'generic-severe',
  'mutation-selection-balance',
  'Mutation-Selection Balance',
  'Mutation refills the allele faster than selection can remove it, creating a non-zero equilibrium.',
  ['Strong selection on aa', 'Mutation ON (mu=0.001)'],
  {
    ...baseParams(),
    initialAlleleFrequency: 0.02,
    survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.05 },
    fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.05 },
    mutationRate: 0.001,
    generations: 150,
  },
)

const genericDrift = makePreset(
  'generic-severe',
  'small-population-drift',
  'Small Population Drift',
  'Tiny N lets genotype counts bounce around even with neutral selection.',
  ['Tiny N=120', 'Selection OFF', 'Drift-dominated'],
  {
    ...baseParams(),
    initialPopulation: 120,
    survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 1 },
    fertilityMultiplier: { AA: 1, Aa: 1, aa: 1 },
    generations: 120,
  },
)

const sickleBalancing = makePreset(
  'sickle-cell',
  'sickle-balancing',
  'Sickle-like Balancing Selection',
  'Malaria pressure favors HbAS carriers and sustains a non-zero HbS allele frequency.',
  ['Malaria ON', 'Strong het advantage', 'aa survival low'],
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

const sickleLowMalaria = makePreset(
  'sickle-cell',
  'sickle-low-malaria',
  'Sickle in Low-Malaria Setting',
  'Weak carrier advantage cannot offset disease burden; allele declines over generations.',
  ['Malaria ON (weak)', 'Selection on aa'],
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
)

const sickleConsanguinity = makePreset(
  'sickle-cell',
  'sickle-consanguinity',
  'Sickle with Consanguinity',
  'Inbreeding-like pairing raises HbSS births even while malaria sustains the HbS allele.',
  ['Malaria ON', 'Consanguinity HIGH', 'aa births up'],
  {
    ...baseParams(),
    survivalToReproductiveAge: { AA: 0.92, Aa: 1, aa: 0.2 },
    fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.5 },
    modifiers: {
      malariaPressure: true,
      heterozygoteAdvantageStrength: 0.55,
      carrierPairingBias: 0.12,
      consanguinityBoost: 0.15,
      endogamyBias: 0.2,
    },
  },
)

const thalTreatment = makePreset(
  'beta-thal-major',
  'thal-treatment',
  'Thalassemia + Treatment Improvement',
  'Affected survival and fertility improve after treatment era begins at generation 11.',
  ['Treatment ON at gen 11', 'aa rescue'],
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

const thalUntreated = makePreset(
  'beta-thal-major',
  'thal-untreated',
  'Thalassemia Without Treatment Transition',
  'Persistent strong selection drives faster decline of severe genotype.',
  ['Strong selection on aa', 'No treatment'],
  {
    ...baseParams(),
    survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.08 },
    fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.08 },
  },
)

const thalMutationBalance = makePreset(
  'beta-thal-major',
  'thal-mutation-balance',
  'Thalassemia with Mutation Input',
  'Mutation refills rare alleles and sets a long-run floor under selection.',
  ['Strong selection', 'Mutation ON (mu=0.0005)'],
  {
    ...baseParams(),
    initialAlleleFrequency: 0.04,
    survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 0.08 },
    fertilityMultiplier: { AA: 1, Aa: 1, aa: 0.08 },
    mutationRate: 0.0005,
    generations: 160,
  },
)

const hsDominantStable = makePreset(
  'hereditary-spherocytosis',
  'hs-dominant-stable',
  'Dominant Burden with Mild Selection',
  'Heterozygous burden persists when selection on Aa and aa is modest.',
  ['Dominant burden on Aa', 'Mild selection'],
  {
    ...baseParams(),
    initialAlleleFrequency: 0.08,
    survivalToReproductiveAge: { AA: 1, Aa: 0.82, aa: 0.45 },
    fertilityMultiplier: { AA: 1, Aa: 0.9, aa: 0.4 },
  },
)

const hsImprovedManagement = makePreset(
  'hereditary-spherocytosis',
  'hs-improved-management',
  'Dominant Burden with Care Improvement',
  'Clinical care reduces selection against severe-burden dominant genotypes over time.',
  ['Dominant burden', 'Treatment ON at gen 12'],
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
)

const hsEndogamy = makePreset(
  'hereditary-spherocytosis',
  'hs-endogamy',
  'Dominant Burden with Endogamy',
  'Endogamy raises homozygous births and drags the allele down faster.',
  ['Dominant burden', 'Endogamy HIGH'],
  {
    ...baseParams(),
    initialAlleleFrequency: 0.08,
    survivalToReproductiveAge: { AA: 1, Aa: 0.82, aa: 0.45 },
    fertilityMultiplier: { AA: 1, Aa: 0.9, aa: 0.4 },
    modifiers: {
      malariaPressure: false,
      heterozygoteAdvantageStrength: 0,
      carrierPairingBias: 0.1,
      consanguinityBoost: 0.1,
      endogamyBias: 0.3,
    },
  },
)

const g6pdNeutral = makePreset(
  'g6pd-deficiency',
  'g6pd-neutral',
  'X-linked Approx, Low Selection',
  'Carrier-like states remain common while high-burden state stays lower.',
  ['Weak selection', 'No malaria'],
  {
    ...baseParams(),
    initialAlleleFrequency: 0.16,
    survivalToReproductiveAge: { AA: 1, Aa: 0.97, aa: 0.78 },
    fertilityMultiplier: { AA: 1, Aa: 0.98, aa: 0.86 },
  },
)

const g6pdMalariaContext = makePreset(
  'g6pd-deficiency',
  'g6pd-malaria-context',
  'X-linked Approx in Malaria Context',
  'Environmental protection can maintain trait-associated variants.',
  ['Malaria ON', 'Het advantage'],
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
)

const g6pdDriftMalaria = makePreset(
  'g6pd-deficiency',
  'g6pd-drift-malaria',
  'Small Population with Malaria',
  'Limited N lets drift interact with weak balancing selection.',
  ['Malaria ON', 'Small N=250', 'Drift + selection'],
  {
    ...baseParams(),
    initialPopulation: 250,
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
    generations: 150,
  },
)

const hbscModerate = makePreset(
  'hbsc',
  'hbsc-moderate-burden',
  'HbSC-like Moderate Burden',
  'Compound heterozygous class carries burden but persists under weak malaria pressure.',
  ['Malaria ON (weak)', 'Compound burden'],
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
)

const hbscImproved = makePreset(
  'hbsc',
  'hbsc-improved-therapy',
  'HbSC-like With Care Improvement',
  'Care improvements reduce selection pressure against the higher-burden compound class.',
  ['Malaria ON', 'Treatment ON at gen 12'],
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
)

const hbscDriftOff = makePreset(
  'hbsc',
  'hbsc-malaria-off',
  'HbSC-like Without Malaria',
  'Remove the environmental support and the compound genotype declines steadily.',
  ['Malaria OFF', 'Compound burden'],
  {
    ...baseParams(),
    initialAlleleFrequency: 0.1,
    survivalToReproductiveAge: { AA: 1, Aa: 0.84, aa: 0.35 },
    fertilityMultiplier: { AA: 1, Aa: 0.88, aa: 0.42 },
    generations: 140,
  },
)

// ---------------------------------------------------------------------------
// Disease profile registry
// ---------------------------------------------------------------------------

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
    visibleControls: withoutTreatment,
    tooltipOverrides: {
      malariaPressure: {
        label: 'Malaria pressure',
        what: 'Models selective environments where HbAS has a survival edge.',
        reasonable: 'Usually ON for historical endemic malaria scenarios.',
        extremes:
          'If OFF, sickle allele tends to decline under disease burden; if ON with strong advantage, allele persists.',
      },
    },
    scenarios: [sickleBalancing, sickleLowMalaria, sickleConsanguinity],
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
    visibleControls: fullControls,
    scenarios: [thalTreatment, thalUntreated, thalMutationBalance],
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
    visibleControls: withoutMalaria,
    scenarios: [hsDominantStable, hsImprovedManagement, hsEndogamy],
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
    visibleControls: withoutTreatment,
    scenarios: [g6pdNeutral, g6pdMalariaContext, g6pdDriftMalaria],
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
    visibleControls: fullControls,
    scenarios: [hbscModerate, hbscImproved, hbscDriftOff],
  },
  {
    key: 'generic-severe',
    category: 'hematology',
    name: 'Generic Teaching Profile',
    shortDescription: 'Reference teaching profile for isolating one force at a time.',
    inheritanceMode: 'autosomal-recessive',
    focusMessage:
      'Use this profile as a clean baseline to compare selection, drift, and mutation-selection balance.',
    genotypeLabels: {
      AA: 'Unaffected',
      Aa: 'Carrier',
      aa: 'Affected',
    },
    visibleControls: fullControls,
    scenarios: [
      genericNeutral,
      genericSevere,
      genericMutationBalance,
      genericDrift,
    ],
  },
]

export const defaultDiseaseKey = 'sickle-cell'
export const defaultPresetKey = 'sickle-balancing'
