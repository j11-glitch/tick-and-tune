import { getAudioContext } from './audioContext'

// A friendly "ding-ding-ding" chime, repeated a few times.
const CHIME = [
  { at: 0, frequency: 1047 },
  { at: 0.22, frequency: 1319 },
  { at: 0.44, frequency: 1568 },
]
const REPEATS = 6
const REPEAT_EVERY_S = 1.6

/** Plays the time-up alarm (and vibrates where supported). Returns a function that stops it. */
export function playAlarm(): () => void {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  const output = ctx.createGain()
  output.connect(ctx.destination)

  const start = ctx.currentTime + 0.05
  for (let r = 0; r < REPEATS; r++) {
    for (const note of CHIME) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      const time = start + r * REPEAT_EVERY_S + note.at
      oscillator.type = 'triangle'
      oscillator.frequency.value = note.frequency
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.exponentialRampToValueAtTime(0.7, time + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.5)
      oscillator.connect(gain).connect(output)
      oscillator.start(time)
      oscillator.stop(time + 0.55)
    }
  }
  navigator.vibrate?.([400, 200, 400, 200, 400])

  return () => {
    output.gain.setValueAtTime(0, ctx.currentTime)
    output.disconnect()
    navigator.vibrate?.(0)
  }
}

