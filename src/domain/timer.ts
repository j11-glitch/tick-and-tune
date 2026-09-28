/**
 * Practice countdown. Time is kept as an absolute end time, so it stays correct even when
 * the browser slows down timers in a background tab.
 */
export type TimerState =
  | { readonly status: 'running'; readonly durationMs: number; readonly endsAt: number }
  | { readonly status: 'paused'; readonly durationMs: number; readonly remainingMs: number }

export const DURATIONS_MINUTES = [10, 15, 20, 25, 30, 45] as const
export const DEFAULT_MINUTES = 20

export function startTimer(minutes: number, now: number): TimerState {
  const durationMs = minutes * 60_000
  return { status: 'running', durationMs, endsAt: now + durationMs }
}

export function remainingMs(state: TimerState, now: number): number {
  return state.status === 'running' ? Math.max(0, state.endsAt - now) : state.remainingMs
}

export function isTimeUp(state: TimerState, now: number): boolean {
  return remainingMs(state, now) === 0
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  if (state.status === 'paused') return state
  return { status: 'paused', durationMs: state.durationMs, remainingMs: remainingMs(state, now) }
}

export function resumeTimer(state: TimerState, now: number): TimerState {
  if (state.status === 'running') return state
  return { status: 'running', durationMs: state.durationMs, endsAt: now + state.remainingMs }
}

/** Adds time (e.g. "5 more minutes" after the alarm). */
export function extendTimer(state: TimerState, minutes: number, now: number): TimerState {
  const extra = minutes * 60_000
  return {
    status: 'running',
    durationMs: state.durationMs + extra,
    endsAt: now + remainingMs(state, now) + extra,
  }
}

/** Fraction of the practice done, 0..1. */
export function progress(state: TimerState, now: number): number {
  return state.durationMs === 0 ? 1 : 1 - remainingMs(state, now) / state.durationMs
}

/** "19:05" style clock; rounds up so the clock shows 0:00 only when time is really up. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
