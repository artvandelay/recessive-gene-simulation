import { useEffect, useMemo, useState } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { PopulationView } from './components/PopulationView'
import { ScenarioCard } from './components/ScenarioCard'
import { StatsPanel } from './components/StatsPanel'
import { TimelineControls } from './components/TimelineControls'
import { defaultPreset, presets } from './sim/presets'
import { runDeterministicSimulation } from './sim/engine'
import type { SimulationParams } from './sim/types'

function App() {
  const [selectedPresetKey, setSelectedPresetKey] = useState(defaultPreset.key)
  const [params, setParams] = useState<SimulationParams>(defaultPreset.params)
  const [currentGeneration, setCurrentGeneration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const selectedPreset =
    presets.find((preset) => preset.key === selectedPresetKey) ?? defaultPreset

  const snapshots = useMemo(() => runDeterministicSimulation(params), [params])
  const maxGeneration = snapshots.length - 1
  const safeGeneration = Math.min(currentGeneration, maxGeneration)
  const currentSnapshot = snapshots[safeGeneration]

  useEffect(() => {
    if (!isPlaying) return
    const intervalMs = Math.max(100, Math.round(680 / animationSpeed))
    const timer = window.setInterval(() => {
      setCurrentGeneration((prev) => {
        if (prev >= snapshots.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [animationSpeed, isPlaying, snapshots.length])

  const applyPreset = (presetKey: string) => {
    const selected = presets.find((preset) => preset.key === presetKey)
    if (!selected) return
    setSelectedPresetKey(selected.key)
    setParams(selected.params)
    setCurrentGeneration(0)
    setIsPlaying(false)
  }

  const resetToPreset = () => applyPreset(selectedPresetKey)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[380px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h1 className="text-xl font-semibold text-slate-100">
            Recessive Disease Population Simulator
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Explore how genotype prevalence changes over generations under
            selection, mating structure, and treatment.
          </p>

          <div className="mt-4 space-y-2">
            {presets.map((preset) => (
              <ScenarioCard
                key={preset.key}
                preset={preset}
                selected={preset.key === selectedPresetKey}
                onClick={() => applyPreset(preset.key)}
              />
            ))}
          </div>

          <ControlPanel
            params={params}
            baselineParams={selectedPreset.params}
            onParamsChange={setParams}
            onReset={resetToPreset}
          />
        </aside>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Population Composition</h2>
              <p className="text-sm text-slate-300">
                25-50-25 only applies to carrier x carrier pairings, not whole
                populations.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
              Generation {currentSnapshot.generation}
            </span>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
            <PopulationView snapshot={currentSnapshot} />
            <StatsPanel
              current={currentSnapshot}
              history={snapshots.slice(0, safeGeneration + 1)}
            />
          </div>

          <TimelineControls
            currentGeneration={safeGeneration}
            maxGeneration={maxGeneration}
            isPlaying={isPlaying}
            animationSpeed={animationSpeed}
            onPlayPause={() => {
              if (safeGeneration >= maxGeneration) {
                setCurrentGeneration(0)
              }
              setIsPlaying((prev) => !prev)
            }}
            onReset={() => {
              setIsPlaying(false)
              setCurrentGeneration(0)
            }}
            onGenerationChange={(value) => {
              setIsPlaying(false)
              setCurrentGeneration(value)
            }}
            onSpeedChange={setAnimationSpeed}
          />
        </section>
      </div>
    </main>
  )
}

export default App
