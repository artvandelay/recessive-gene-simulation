import { describe, expect, it } from 'vitest'
import { controlSpecs } from './controlSchema'
import { diseaseProfiles, presets } from './presets'

describe('disease profile registry', () => {
  it('contains multiple hemat profiles and starts hemat-first', () => {
    expect(diseaseProfiles.length).toBeGreaterThanOrEqual(6)
    expect(diseaseProfiles[0].category).toBe('hematology')
  })

  it('each profile has scenarios and valid visible controls', () => {
    for (const profile of diseaseProfiles) {
      expect(profile.scenarios.length).toBeGreaterThan(0)
      for (const controlKey of profile.visibleControls) {
        expect(controlSpecs[controlKey]).toBeDefined()
      }
    }
  })

  it('all scenarios are discoverable in flat preset registry', () => {
    for (const profile of diseaseProfiles) {
      for (const scenario of profile.scenarios) {
        const found = presets.find((preset) => preset.key === scenario.key)
        expect(found?.diseaseKey).toBe(profile.key)
      }
    }
  })

  it('every preset exposes at least one highlight badge', () => {
    for (const preset of presets) {
      expect(Array.isArray(preset.highlights)).toBe(true)
      expect(preset.highlights.length).toBeGreaterThan(0)
      for (const label of preset.highlights) {
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      }
    }
  })

  it('every profile offers at least three named scenarios', () => {
    for (const profile of diseaseProfiles) {
      expect(profile.scenarios.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('every preset has a mutationRate field (default 0 unless overridden)', () => {
    for (const preset of presets) {
      expect(typeof preset.params.mutationRate).toBe('number')
      expect(preset.params.mutationRate).toBeGreaterThanOrEqual(0)
    }
  })
})
