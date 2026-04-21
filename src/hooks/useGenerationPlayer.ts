import { useCallback, useEffect, useState } from 'react'

interface UseGenerationPlayerOptions {
  maxGeneration: number
  baseIntervalMs?: number
  minIntervalMs?: number
}

export interface GenerationPlayer {
  generation: number
  isPlaying: boolean
  speed: number
  togglePlay: () => void
  reset: () => void
  setGeneration: (value: number) => void
  setSpeed: (value: number) => void
}

/**
 * Drives the generation scrubber: owns playback state, advances a timer when
 * playing, and auto-pauses once the run reaches its final generation.
 */
export function useGenerationPlayer({
  maxGeneration,
  baseIntervalMs = 680,
  minIntervalMs = 100,
}: UseGenerationPlayerOptions): GenerationPlayer {
  const [generation, setGenerationState] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    if (!isPlaying) return
    const intervalMs = Math.max(minIntervalMs, Math.round(baseIntervalMs / speed))
    const timer = window.setInterval(() => {
      setGenerationState((prev) => {
        if (prev >= maxGeneration) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [isPlaying, speed, maxGeneration, baseIntervalMs, minIntervalMs])

  const togglePlay = useCallback(() => {
    setGenerationState((prev) => (prev >= maxGeneration ? 0 : prev))
    setIsPlaying((prev) => !prev)
  }, [maxGeneration])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setGenerationState(0)
  }, [])

  const setGeneration = useCallback((value: number) => {
    setIsPlaying(false)
    setGenerationState(value)
  }, [])

  return {
    generation: Math.min(generation, maxGeneration),
    isPlaying,
    speed,
    togglePlay,
    reset,
    setGeneration,
    setSpeed,
  }
}
