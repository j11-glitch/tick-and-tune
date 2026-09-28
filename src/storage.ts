import { DEFAULT_BPM } from './domain/metronome'
import { DEFAULT_MINUTES } from './domain/timer'

/** Remembered choices, so the next practice starts where the last one left off. */
export interface Preferences {
  readonly songs: Readonly<Record<string, readonly string[]>>
  readonly minutes: Readonly<Record<string, number>>
  readonly bpm: number
  readonly beatsPerBar: number
}

const KEY = 'tick-and-tune:preferences:v1'
const DEFAULTS: Preferences = { songs: {}, minutes: {}, bpm: DEFAULT_BPM, beatsPerBar: 4 }

export function loadPreferences(): Preferences {
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function savePreferences(preferences: Preferences): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(preferences))
  } catch {
    // Storage may be unavailable; the app still works without remembering choices.
  }
}

export { DEFAULT_MINUTES }
