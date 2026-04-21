import { describe, expect, it } from 'vitest'
import { runDeterministicSimulation } from './engine'
import { diseaseProfiles, presets } from './presets'
import type { SimulationParams } from './types'

function cloneParams(params: SimulationParams): SimulationParams {
  return JSON.parse(JSON.stringify(params)) as SimulationParams
}

describe('stress tests across all disease profiles', () => {
  it('every preset runs 200 generations without NaN or negative counts', () => {
    for (const preset of presets) {
      const params = cloneParams(preset.params)
      params.generations = 200
      const snapshots = runDeterministicSimulation(params)

      expect(snapshots.length).toBe(201)
      for (const snap of snapshots) {
        expect(Number.isFinite(snap.alleleFrequencyQ)).toBe(true)
        expect(snap.alleleFrequencyQ).toBeGreaterThanOrEqual(0)
        expect(snap.alleleFrequencyQ).toBeLessThanOrEqual(1)
        expect(snap.counts.AA).toBeGreaterThanOrEqual(0)
        expect(snap.counts.Aa).toBeGreaterThanOrEqual(0)
        expect(snap.counts.aa).toBeGreaterThanOrEqual(0)
        expect(Number.isFinite(snap.carrierPrevalence)).toBe(true)
        expect(Number.isFinite(snap.affectedPrevalence)).toBe(true)
      }
    }
  })

  it('population accounting holds for every preset in fixed-size mode', () => {
    for (const preset of presets) {
      const params = cloneParams(preset.params)
      params.generations = 150
      params.fixedPopulationSize = true
      const snapshots = runDeterministicSimulation(params)

      for (const snap of snapshots) {
        const total = snap.counts.AA + snap.counts.Aa + snap.counts.aa
        expect(total).toBe(snap.population)
        expect(snap.population).toBe(params.initialPopulation)
      }
    }
  })

  it('prevalence values match counts exactly for every preset', () => {
    for (const preset of presets) {
      const params = cloneParams(preset.params)
      params.generations = 100
      const snapshots = runDeterministicSimulation(params)

      for (const snap of snapshots) {
        const N = snap.population
        expect(snap.carrierPrevalence).toBe(snap.counts.Aa / N)
        expect(snap.affectedPrevalence).toBe(snap.counts.aa / N)
        const expectedQ = (snap.counts.Aa + 2 * snap.counts.aa) / (2 * N)
        expect(snap.alleleFrequencyQ).toBe(expectedQ)
      }
    }
  })

  it('handles extreme allele frequencies without breaking', () => {
    const lowQ = cloneParams(presets[0].params)
    lowQ.initialAlleleFrequency = 0.001
    lowQ.generations = 50
    const lowSnaps = runDeterministicSimulation(lowQ)
    expect(lowSnaps.length).toBe(51)
    expect(lowSnaps[0].counts.aa).toBeGreaterThanOrEqual(0)

    const highQ = cloneParams(presets[0].params)
    highQ.initialAlleleFrequency = 0.49
    highQ.generations = 50
    const highSnaps = runDeterministicSimulation(highQ)
    expect(highSnaps.length).toBe(51)
    for (const snap of highSnaps) {
      expect(snap.alleleFrequencyQ).toBeLessThanOrEqual(1)
    }
  })

  it('handles very small populations without crashing', () => {
    const params = cloneParams(presets[0].params)
    params.initialPopulation = 10
    params.generations = 100
    params.fixedPopulationSize = true
    const snapshots = runDeterministicSimulation(params)

    expect(snapshots.length).toBe(101)
    for (const snap of snapshots) {
      const total = snap.counts.AA + snap.counts.Aa + snap.counts.aa
      expect(total).toBe(snap.population)
    }
  })

  it('handles very large populations without NaN', () => {
    const params = cloneParams(presets[0].params)
    params.initialPopulation = 100000
    params.generations = 50
    params.fixedPopulationSize = true
    const snapshots = runDeterministicSimulation(params)

    expect(snapshots.length).toBe(51)
    for (const snap of snapshots) {
      expect(Number.isFinite(snap.alleleFrequencyQ)).toBe(true)
      const total = snap.counts.AA + snap.counts.Aa + snap.counts.aa
      expect(total).toBe(100000)
    }
  })

  it('variable population mode does not produce zero or negative population', () => {
    for (const preset of presets) {
      const params = cloneParams(preset.params)
      params.generations = 120
      params.fixedPopulationSize = false
      params.averageChildrenPerCouple = 1.5
      const snapshots = runDeterministicSimulation(params)

      for (const snap of snapshots) {
        expect(snap.population).toBeGreaterThanOrEqual(2)
        expect(Number.isFinite(snap.population)).toBe(true)
      }
    }
  })

  it('all disease profiles have at least one scenario with matching diseaseKey', () => {
    for (const profile of diseaseProfiles) {
      expect(profile.scenarios.length).toBeGreaterThan(0)
      for (const scenario of profile.scenarios) {
        expect(scenario.diseaseKey).toBe(profile.key)
      }
    }
  })

  it('no two presets share the same key', () => {
    const keys = presets.map((preset) => preset.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('no two disease profiles share the same key', () => {
    const keys = diseaseProfiles.map((profile) => profile.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('100-generation run completes in under 50ms per preset', () => {
    for (const preset of presets) {
      const params = cloneParams(preset.params)
      params.generations = 100
      const start = performance.now()
      runDeterministicSimulation(params)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(50)
    }
  })
})
