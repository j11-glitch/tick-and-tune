export const MIN_BPM = 40
export const MAX_BPM = 208
export const DEFAULT_BPM = 80
export const BEATS_PER_BAR_OPTIONS = [2, 3, 4] as const

export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) return DEFAULT_BPM
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)))
}

export function secondsPerBeat(bpm: number): number {
  return 60 / clampBpm(bpm)
}

/** The first beat of every bar is accented. */
export function isAccent(beatIndex: number, beatsPerBar: number): boolean {
  return beatIndex % beatsPerBar === 0
}

/** A pause longer than this starts a new tap-tempo measurement. */
export const TAP_RESET_MS = 2000

/**
 * Tempo from tap times (ms). Uses the average of the last few intervals; returns null
 * until there are at least two taps in the current run.
 */
export function tapTempo(taps: readonly number[]): number | null {
  let start = taps.length - 1
  while (start > 0 && taps[start] - taps[start - 1] <= TAP_RESET_MS) start--
  const run = taps.slice(start).slice(-5)
  if (run.length < 2) return null
  const average = (run[run.length - 1] - run[0]) / (run.length - 1)
  return clampBpm(60_000 / average)
}
