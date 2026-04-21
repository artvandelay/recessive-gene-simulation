import { useMemo, useState } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { PopulationView } from './components/PopulationView'
import { ScenarioCard } from './components/ScenarioCard'
import { StatsPanel } from './components/StatsPanel'
import { TimelineControls } from './components/TimelineControls'
import { useGenerationPlayer } from './hooks/useGenerationPlayer'
import { runDeterministicSimulation } from './sim/engine'
import {
  defaultDisease,
  defaultPreset,
  diseaseProfiles,
} from './sim/presets'
import type { DiseaseProfile, ScenarioPreset, SimulationParams } from './sim/types'

function App() {
  const [diseaseKey, setDiseaseKey] = useState(defaultDisease.key)
  const [presetKey, setPresetKey] = useState(defaultPreset.key)
  const [params, setParams] = useState<SimulationParams>(defaultPreset.params)

  const disease = findDisease(diseaseKey)
  const preset = findPreset(disease, presetKey)

  const snapshots = useMemo(() => runDeterministicSimulation(params), [params])
  const maxGeneration = snapshots.length - 1

  const player = useGenerationPlayer({ maxGeneration })
  const currentSnapshot = snapshots[player.generation]
  const previousSnapshot = snapshots[player.generation - 1] ?? null

  const selectPreset = (key: string) => {
    const next = disease.scenarios.find((p) => p.key === key)
    if (!next) return
    setPresetKey(next.key)
    setParams(next.params)
    player.reset()
  }

  const selectDisease = (key: string) => {
    const nextDisease = diseaseProfiles.find((d) => d.key === key)
    if (!nextDisease) return
    const [firstPreset] = nextDisease.scenarios
    setDiseaseKey(nextDisease.key)
    setPresetKey(firstPreset.key)
    setParams(firstPreset.params)
    player.reset()
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[380px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h1 className="text-xl font-semibold text-slate-100">
            Hemat Genetic Population Simulator
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Explore population-scale trajectories across hematologic inheritance
            patterns while preserving clinically relevant detail.
          </p>

          <label className="mt-4 block text-xs text-slate-300">
            Disease profile
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100"
              value={disease.key}
              onChange={(event) => selectDisease(event.target.value)}
            >
              {diseaseProfiles.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/40 p-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              {disease.inheritanceMode.replace('-', ' ')}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {disease.shortDescription}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {disease.scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.key}
                preset={scenario}
                selected={scenario.key === presetKey}
                onClick={() => selectPreset(scenario.key)}
              />
            ))}
          </div>

          <ControlPanel
            params={params}
            baselineParams={preset.params}
            profile={disease}
            onParamsChange={setParams}
            onReset={() => selectPreset(presetKey)}
          />
        </aside>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Population Composition</h2>
              <p className="text-sm text-slate-300">{disease.focusMessage}</p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
              Generation {currentSnapshot.generation}
            </span>
          </header>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
            <PopulationView
              snapshots={snapshots}
              currentIndex={player.generation}
              genotypeLabels={disease.genotypeLabels}
            />
            <StatsPanel
              current={currentSnapshot}
              previous={previousSnapshot}
              genotypeLabels={disease.genotypeLabels}
              metricLabels={disease.metricLabels}
            />
          </div>

          <TimelineControls
            currentGeneration={player.generation}
            maxGeneration={maxGeneration}
            isPlaying={player.isPlaying}
            animationSpeed={player.speed}
            onPlayPause={player.togglePlay}
            onReset={player.reset}
            onGenerationChange={player.setGeneration}
            onSpeedChange={player.setSpeed}
          />
        </section>
      </div>
    </main>
  )
}

function findDisease(key: string): DiseaseProfile {
  return diseaseProfiles.find((d) => d.key === key) ?? defaultDisease
}

function findPreset(disease: DiseaseProfile, key: string): ScenarioPreset {
  return (
    disease.scenarios.find((p) => p.key === key) ??
    disease.scenarios[0] ??
    defaultPreset
  )
}

export default App
