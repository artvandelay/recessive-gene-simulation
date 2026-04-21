interface TimelineControlsProps {
  currentGeneration: number
  maxGeneration: number
  isPlaying: boolean
  animationSpeed: number
  onPlayPause: () => void
  onReset: () => void
  onGenerationChange: (value: number) => void
  onSpeedChange: (value: number) => void
}

export function TimelineControls({
  currentGeneration,
  maxGeneration,
  isPlaying,
  animationSpeed,
  onPlayPause,
  onReset,
  onGenerationChange,
  onSpeedChange,
}: TimelineControlsProps) {
  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
          onClick={onPlayPause}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm hover:bg-slate-800"
          onClick={onReset}
        >
          Reset
        </button>
        <span className="ml-auto text-xs text-slate-300">
          Gen {currentGeneration}/{maxGeneration}
        </span>
      </div>

      <label className="mt-3 block text-xs text-slate-300">
        Generation scrubber
        <input
          className="mt-1 w-full accent-indigo-400"
          type="range"
          min={0}
          max={maxGeneration}
          step={1}
          value={currentGeneration}
          onChange={(event) => onGenerationChange(Number(event.target.value))}
        />
      </label>

      <label className="mt-3 block text-xs text-slate-300">
        Animation speed ({animationSpeed.toFixed(1)}x)
        <input
          className="mt-1 w-full accent-indigo-400"
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={animationSpeed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        />
      </label>
    </div>
  )
}
