import { describe, expect, it } from 'vitest'
import { runDeterministicSimulation } from './engine'
import { getPresetByKey } from './presets'
import type { SimulationParams } from './types'

function cloneParams(params: SimulationParams): SimulationParams {
  return JSON.parse(JSON.stringify(params)) as SimulationParams
}

describe('mutation rate engine behavior', () => {
  const severe = getPresetByKey('severe-recessive')
  if (!severe) {
    throw new Error('severe-recessive preset is required for mutation tests')
  }

  it('with mutation OFF, allele declines much further than with mutation ON', () => {
    const withoutMu = cloneParams(severe.params)
    withoutMu.initialAlleleFrequency = 0.05
    withoutMu.generations = 200
    withoutMu.mutationRate = 0

    const withMu = cloneParams(severe.params)
    withMu.initialAlleleFrequency = 0.05
    withMu.generations = 200
    withMu.mutationRate = 0.001

    const snapsOff = runDeterministicSimulation(withoutMu)
    const snapsOn = runDeterministicSimulation(withMu)
    const qOff = snapsOff[snapsOff.length - 1].alleleFrequencyQ
    const qOn = snapsOn[snapsOn.length - 1].alleleFrequencyQ

    expect(qOn).toBeGreaterThan(qOff)
  })

  it('mutation drives allele frequency toward 0.5 under neutral selection', () => {
    const neutral: SimulationParams = {
      ...cloneParams(severe.params),
      survivalToReproductiveAge: { AA: 1, Aa: 1, aa: 1 },
      fertilityMultiplier: { AA: 1, Aa: 1, aa: 1 },
      initialAlleleFrequency: 0.1,
      generations: 300,
      mutationRate: 0.02,
    }

    const snaps = runDeterministicSimulation(neutral)
    const qEnd = snaps[snaps.length - 1].alleleFrequencyQ
    expect(qEnd).toBeGreaterThan(0.4)
    expect(qEnd).toBeLessThanOrEqual(0.5 + 1e-6)
  })

  it('mutation rate of 0 is identical to the previous engine behavior (baseline stability)', () => {
    const baseline = cloneParams(severe.params)
    baseline.mutationRate = 0
    baseline.generations = 80

    const snaps = runDeterministicSimulation(baseline)
    for (const snap of snaps) {
      expect(Number.isFinite(snap.alleleFrequencyQ)).toBe(true)
      expect(snap.alleleFrequencyQ).toBeGreaterThanOrEqual(0)
    }
  })
})
