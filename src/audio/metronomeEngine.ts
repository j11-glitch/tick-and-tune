import { clampBpm, isAccent, secondsPerBeat } from '../domain/metronome'
import { getAudioContext, playTone } from './audioContext'

// Look-ahead scheduling ("A Tale of Two Clocks"): a coarse JS timer wakes up every 25 ms
// and schedules the clicks that fall in the next 120 ms on the precise audio clock.
const WAKE_UP_MS = 25
const SCHEDULE_AHEAD_S = 0.12

export class MetronomeEngine {
  private timer: ReturnType<typeof setInterval> | null = null
  private nextBeatTime = 0
  private beat = 0
  private bpm: number
  private beatsPerBar: number

  constructor(
    bpm: number,
    beatsPerBar: number,
    /** Called (roughly) when each beat sounds, for the visual beat light. */
    private readonly onBeat: (beatInBar: number) => void,
  ) {
    this.bpm = clampBpm(bpm)
    this.beatsPerBar = beatsPerBar
  }

  get running(): boolean {
    return this.timer !== null
  }

  start(): void {
    if (this.timer) return
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    this.beat = 0
    this.nextBeatTime = ctx.currentTime + 0.06
    this.schedule()
    this.timer = setInterval(() => this.schedule(), WAKE_UP_MS)
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /** Takes effect from the next beat, so changing tempo while playing feels smooth. */
  setBpm(bpm: number): void {
    this.bpm = clampBpm(bpm)
  }

  setBeatsPerBar(beats: number): void {
    this.beatsPerBar = beats
    this.beat = 0
  }

  private schedule(): void {
    const ctx = getAudioContext()
    while (this.nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const accent = isAccent(this.beat, this.beatsPerBar)
      playTone(ctx, this.nextBeatTime, accent ? 1760 : 1175, 0.05, accent ? 0.9 : 0.55)
      const beatInBar = this.beat % this.beatsPerBar
      const delay = Math.max(0, (this.nextBeatTime - ctx.currentTime) * 1000)
      setTimeout(() => this.onBeat(beatInBar), delay)
      this.nextBeatTime += secondsPerBeat(this.bpm)
      this.beat = (this.beat + 1) % this.beatsPerBar
    }
  }
}
