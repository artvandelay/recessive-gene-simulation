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
})
