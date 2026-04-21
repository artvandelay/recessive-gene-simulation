import { describe, expect, it } from 'vitest'
import { runDeterministicSimulation } from './engine'
import { getPresetByKey } from './presets'
import type { SimulationParams } from './types'

function cloneParams(params: SimulationParams): SimulationParams {
  return JSON.parse(JSON.stringify(params)) as SimulationParams
}

describe('deterministic simulation scientific checks', () => {
  const neutralPreset = getPresetByKey('neutral-recessive')
  const severePreset = getPresetByKey('severe-recessive')
  const balancingPreset = getPresetByKey('sickle-balancing')
  const treatmentPreset = getPresetByKey('thal-treatment')

  if (!neutralPreset || !severePreset || !balancingPreset || !treatmentPreset) {
    throw new Error('Core scientific presets are missing from preset registry.')
  }

  it('neutral recessive keeps allele frequency approximately conserved', () => {
    const params = cloneParams(neutralPreset.params)
    params.generations = 100
    const snapshots = runDeterministicSimulation(params)

    const q0 = snapshots[0].alleleFrequencyQ
    const qEnd = snapshots[snapshots.length - 1].alleleFrequencyQ
    expect(Math.abs(qEnd - q0)).toBeLessThan(0.01)
  })

  it('strong selection against aa lowers affected prevalence', () => {
    const params = cloneParams(severePreset.params)
    params.generations = 80
    const snapshots = runDeterministicSimulation(params)

    const affected0 = snapshots[0].affectedPrevalence
    const affectedEnd = snapshots[snapshots.length - 1].affectedPrevalence
    expect(affectedEnd).toBeLessThan(affected0)
  })

  it('carrier prevalence declines more slowly than affected prevalence', () => {
    const params = cloneParams(severePreset.params)
    params.generations = 80
    const snapshots = runDeterministicSimulation(params)

    const carrier0 = snapshots[0].carrierPrevalence
    const affected0 = snapshots[0].affectedPrevalence
    const carrierDrop =
      carrier0 - snapshots[snapshots.length - 1].carrierPrevalence
    const affectedDrop =
      affected0 - snapshots[snapshots.length - 1].affectedPrevalence
    const carrierRelativeDrop = carrierDrop / carrier0
    const affectedRelativeDrop = affectedDrop / affected0

    expect(carrierDrop).toBeGreaterThan(0)
    expect(affectedDrop).toBeGreaterThan(0)
    expect(carrierRelativeDrop).toBeLessThan(affectedRelativeDrop)
  })

  it('heterozygote advantage converges to non-zero allele frequency', () => {
    const params = cloneParams(balancingPreset.params)
    params.generations = 120
    const snapshots = runDeterministicSimulation(params)

    const qEnd = snapshots[snapshots.length - 1].alleleFrequencyQ
    const qEarlier = snapshots[snapshots.length - 15].alleleFrequencyQ
    expect(qEnd).toBeGreaterThan(0.02)
    expect(Math.abs(qEnd - qEarlier)).toBeLessThan(0.03)
  })

  it('treatment shift softens decline slope after transition', () => {
    const params = cloneParams(treatmentPreset.params)
    params.generations = 80
    const snapshots = runDeterministicSimulation(params)
    const t = params.treatmentShift.startsAtGeneration

    const preSlope =
      (snapshots[t].affectedPrevalence - snapshots[t - 5].affectedPrevalence) / 5
    const postSlope =
      (snapshots[t + 6].affectedPrevalence -
        snapshots[t + 1].affectedPrevalence) /
      5

    expect(preSlope).toBeLessThan(0)
    expect(postSlope).toBeGreaterThan(preSlope)
  })

  it('population accounting remains exact in fixed-size mode', () => {
    const params = cloneParams(severePreset.params)
    params.generations = 60
    params.fixedPopulationSize = true

    const snapshots = runDeterministicSimulation(params)
    for (const snapshot of snapshots) {
      const genotypeTotal =
        snapshot.counts.AA + snapshot.counts.Aa + snapshot.counts.aa
      expect(genotypeTotal).toBe(snapshot.population)
      expect(snapshot.population).toBe(params.initialPopulation)
    }
  })

  it('displayed prevalence and allele values match counts exactly', () => {
    const params = cloneParams(severePreset.params)
    params.generations = 40
    const snapshots = runDeterministicSimulation(params)

    for (const snapshot of snapshots) {
      const N = snapshot.population
      const counts = snapshot.counts
      const expectedCarrier = counts.Aa / N
      const expectedAffected = counts.aa / N
      const expectedQ = (counts.Aa + 2 * counts.aa) / (2 * N)

      expect(snapshot.carrierPrevalence).toBe(expectedCarrier)
      expect(snapshot.affectedPrevalence).toBe(expectedAffected)
      expect(snapshot.alleleFrequencyQ).toBe(expectedQ)
    }
  })
})
