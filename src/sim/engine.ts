import type {
  FitnessConfig,
  GenerationSnapshot,
  GenotypeCounts,
  SimulationParams,
} from './types'

const MIN_POPULATION = 2

interface GenotypeFrequencies {
  AA: number
  Aa: number
  aa: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function normalizeFrequencies(freq: GenotypeFrequencies): GenotypeFrequencies {
  const total = freq.AA + freq.Aa + freq.aa
  if (total <= 0) {
    return { AA: 1, Aa: 0, aa: 0 }
  }

  return {
    AA: freq.AA / total,
    Aa: freq.Aa / total,
    aa: freq.aa / total,
  }
}

export function toGenotypeFrequenciesFromAllele(q: number): GenotypeFrequencies {
  const qClamped = clamp(q, 0, 1)
  const p = 1 - qClamped
  return {
    AA: p * p,
    Aa: 2 * p * qClamped,
    aa: qClamped * qClamped,
  }
}

function roundCountsFromFrequencies(
  population: number,
  frequencies: GenotypeFrequencies,
): GenotypeCounts {
  const safePopulation = Math.max(MIN_POPULATION, Math.round(population))
  const normalized = normalizeFrequencies(frequencies)

  const rawAA = normalized.AA * safePopulation
  const rawAa = normalized.Aa * safePopulation
  const rawaa = normalized.aa * safePopulation

  const counts = {
    AA: Math.floor(rawAA),
    Aa: Math.floor(rawAa),
    aa: Math.floor(rawaa),
  }

  const remainders = [
    { key: 'AA' as const, value: rawAA - counts.AA },
    { key: 'Aa' as const, value: rawAa - counts.Aa },
    { key: 'aa' as const, value: rawaa - counts.aa },
  ].sort((a, b) => b.value - a.value)

  let remaining = safePopulation - (counts.AA + counts.Aa + counts.aa)
  let i = 0
  while (remaining > 0) {
    const key = remainders[i % remainders.length].key
    counts[key] += 1
    remaining -= 1
    i += 1
  }

  return counts
}

export function countsFromAlleleFrequency(
  population: number,
  alleleFrequencyQ: number,
): GenotypeCounts {
  return roundCountsFromFrequencies(
    population,
    toGenotypeFrequenciesFromAllele(alleleFrequencyQ),
  )
}

export function calculateAlleleFrequencyQ(counts: GenotypeCounts): number {
  const total = counts.AA + counts.Aa + counts.aa
  if (total <= 0) return 0
  return (counts.Aa + 2 * counts.aa) / (2 * total)
}

export function createSnapshot(
  generation: number,
  counts: GenotypeCounts,
  population: number,
): GenerationSnapshot {
  const q = calculateAlleleFrequencyQ(counts)
  return {
    generation,
    population,
    counts,
    alleleFrequencyQ: q,
    carrierPrevalence: population > 0 ? counts.Aa / population : 0,
    affectedPrevalence: population > 0 ? counts.aa / population : 0,
  }
}

function resolvedFitness(
  baseSurvival: FitnessConfig,
  baseFertility: FitnessConfig,
  params: SimulationParams,
  currentGeneration: number,
): { survival: FitnessConfig; fertility: FitnessConfig } {
  const survival: FitnessConfig = { ...baseSurvival }
  const fertility: FitnessConfig = { ...baseFertility }

  if (params.modifiers.malariaPressure) {
    const strength = clamp(params.modifiers.heterozygoteAdvantageStrength, 0, 1)
    survival.Aa = clamp(survival.Aa + strength * 0.35, 0.01, 2)
    survival.AA = clamp(survival.AA - strength * 0.18, 0.01, 2)
    survival.aa = clamp(survival.aa - strength * 0.18, 0.01, 2)
  }

  if (
    params.treatmentShift.enabled &&
    currentGeneration >= params.treatmentShift.startsAtGeneration
  ) {
    survival.aa = clamp(params.treatmentShift.improvedSurvivalAA, 0.01, 2)
    fertility.aa = clamp(params.treatmentShift.improvedFertilityAA, 0.01, 2)
  }

  return { survival, fertility }
}

function buildPairingFrequencies(
  parentFreq: GenotypeFrequencies,
  carrierPairingBias: number,
): {
  AA_AA: number
  AA_Aa: number
  AA_aa: number
  Aa_Aa: number
  Aa_aa: number
  aa_aa: number
} {
  const base = {
    AA_AA: parentFreq.AA * parentFreq.AA,
    AA_Aa: 2 * parentFreq.AA * parentFreq.Aa,
    AA_aa: 2 * parentFreq.AA * parentFreq.aa,
    Aa_Aa: parentFreq.Aa * parentFreq.Aa,
    Aa_aa: 2 * parentFreq.Aa * parentFreq.aa,
    aa_aa: parentFreq.aa * parentFreq.aa,
  }

  const safeBias = clamp(carrierPairingBias, 0, 0.95)
  const maxCarrierPairMass = parentFreq.Aa
  const carrierTarget = base.Aa_Aa + safeBias * (maxCarrierPairMass - base.Aa_Aa)
  const delta = carrierTarget - base.Aa_Aa

  if (delta <= 0) return base

  const nonCarrierMass =
    base.AA_AA + base.AA_Aa + base.AA_aa + base.Aa_aa + base.aa_aa
  if (nonCarrierMass <= 0) {
    return { ...base, Aa_Aa: carrierTarget }
  }

  const scale = clamp((nonCarrierMass - delta) / nonCarrierMass, 0, 1)

  return {
    AA_AA: base.AA_AA * scale,
    AA_Aa: base.AA_Aa * scale,
    AA_aa: base.AA_aa * scale,
    Aa_Aa: carrierTarget,
    Aa_aa: base.Aa_aa * scale,
    aa_aa: base.aa_aa * scale,
  }
}

function offspringFrequenciesFromPairs(
  pairing: ReturnType<typeof buildPairingFrequencies>,
): GenotypeFrequencies {
  const offspring = {
    AA:
      pairing.AA_AA +
      pairing.AA_Aa * 0.5 +
      pairing.Aa_Aa * 0.25,
    Aa:
      pairing.AA_Aa * 0.5 +
      pairing.AA_aa +
      pairing.Aa_Aa * 0.5 +
      pairing.Aa_aa * 0.5,
    aa:
      pairing.Aa_Aa * 0.25 +
      pairing.Aa_aa * 0.5 +
      pairing.aa_aa,
  }

  return normalizeFrequencies(offspring)
}

function applyEndogamyBlend(
  frequencies: GenotypeFrequencies,
  endogamyBias: number,
): GenotypeFrequencies {
  const F = clamp(endogamyBias, 0, 0.95)
  if (F <= 0) return frequencies

  const q = frequencies.aa + frequencies.Aa * 0.5
  const p = 1 - q
  const inbred = {
    AA: p * p + F * p * q,
    Aa: 2 * p * q * (1 - F),
    aa: q * q + F * p * q,
  }

  return normalizeFrequencies({
    AA: frequencies.AA * (1 - F) + inbred.AA * F,
    Aa: frequencies.Aa * (1 - F) + inbred.Aa * F,
    aa: frequencies.aa * (1 - F) + inbred.aa * F,
  })
}

function calculateNextPopulationSize(
  params: SimulationParams,
  currentPopulation: number,
  reproductiveEquivalentAdults: number,
): number {
  if (params.fixedPopulationSize) {
    return Math.max(MIN_POPULATION, Math.round(params.initialPopulation))
  }

  const couples = reproductiveEquivalentAdults / 2
  const births = couples * params.averageChildrenPerCouple
  if (!Number.isFinite(births) || births <= 0) {
    return Math.max(MIN_POPULATION, Math.round(currentPopulation))
  }
  return Math.max(MIN_POPULATION, Math.round(births))
}

export function simulateNextGeneration(
  current: GenerationSnapshot,
  params: SimulationParams,
): GenerationSnapshot {
  const { survival, fertility } = resolvedFitness(
    params.survivalToReproductiveAge,
    params.fertilityMultiplier,
    params,
    current.generation,
  )

  const reproductive = {
    AA: current.counts.AA * survival.AA * fertility.AA,
    Aa: current.counts.Aa * survival.Aa * fertility.Aa,
    aa: current.counts.aa * survival.aa * fertility.aa,
  }

  const reproductiveTotal = reproductive.AA + reproductive.Aa + reproductive.aa
  if (reproductiveTotal <= 0) {
    return createSnapshot(current.generation + 1, { ...current.counts }, current.population)
  }

  const parentFreq = normalizeFrequencies({
    AA: reproductive.AA / reproductiveTotal,
    Aa: reproductive.Aa / reproductiveTotal,
    aa: reproductive.aa / reproductiveTotal,
  })

  const carrierPairingBias = clamp(
    params.modifiers.carrierPairingBias + params.modifiers.consanguinityBoost,
    0,
    0.95,
  )
  const pairings = buildPairingFrequencies(parentFreq, carrierPairingBias)
  const offspringRandomized = offspringFrequenciesFromPairs(pairings)
  const offspringBlended = applyEndogamyBlend(
    offspringRandomized,
    params.modifiers.endogamyBias,
  )

  const nextPopulation = calculateNextPopulationSize(
    params,
    current.population,
    reproductiveTotal,
  )
  const nextCounts = roundCountsFromFrequencies(nextPopulation, offspringBlended)

  return createSnapshot(current.generation + 1, nextCounts, nextPopulation)
}

export function runDeterministicSimulation(
  params: SimulationParams,
): GenerationSnapshot[] {
  const snapshots: GenerationSnapshot[] = []
  const startingPopulation = Math.max(MIN_POPULATION, Math.round(params.initialPopulation))
  const initialCounts = countsFromAlleleFrequency(
    startingPopulation,
    params.initialAlleleFrequency,
  )
  snapshots.push(createSnapshot(0, initialCounts, startingPopulation))

  for (let i = 0; i < params.generations; i += 1) {
    const current = snapshots[snapshots.length - 1]
    const next = simulateNextGeneration(current, params)
    snapshots.push(next)
  }

  return snapshots
}
