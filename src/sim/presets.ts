import {
  defaultDiseaseKey,
  defaultPresetKey,
  hematDiseaseProfiles,
} from './diseases'
import type { DiseaseProfile, ScenarioPreset } from './types'

export const diseaseProfiles: DiseaseProfile[] = hematDiseaseProfiles
export const presets: ScenarioPreset[] = diseaseProfiles.flatMap(
  (profile) => profile.scenarios,
)

export function getDiseaseByKey(diseaseKey: string): DiseaseProfile | undefined {
  return diseaseProfiles.find((profile) => profile.key === diseaseKey)
}

export function getPresetByKey(presetKey: string): ScenarioPreset | undefined {
  return presets.find((preset) => preset.key === presetKey)
}

export const defaultDisease =
  getDiseaseByKey(defaultDiseaseKey) ?? diseaseProfiles[0]
export const defaultPreset =
  getPresetByKey(defaultPresetKey) ?? defaultDisease.scenarios[0]
