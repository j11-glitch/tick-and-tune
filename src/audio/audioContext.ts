let context: AudioContext | null = null

/** One shared AudioContext for the metronome and the alarm. */
export function getAudioContext(): AudioContext {
  context ??= new AudioContext()
  return context
}

/**
 * Browsers (especially iOS Safari) only allow sound after a user gesture. Call this from
 * a click handler (e.g. "Start practice") so the alarm can play later on its own.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  // A silent, very short buffer fully unlocks audio on iOS.
  const source = ctx.createBufferSource()
  source.buffer = ctx.createBuffer(1, 1, 22050)
  source.connect(ctx.destination)
  source.start()
}

/** A short tone with a quick fade, scheduled at `time` on the audio clock. */
export function playTone(ctx: AudioContext, time: number, frequency: number, duration: number, volume: number) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(time)
  oscillator.stop(time + duration + 0.02)
}
