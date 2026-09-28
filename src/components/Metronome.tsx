import { useEffect, useRef, useState } from 'react'
import { MetronomeEngine } from '../audio/metronomeEngine'
import { BEATS_PER_BAR_OPTIONS, clampBpm, MAX_BPM, MIN_BPM, tapTempo, TAP_RESET_MS } from '../domain/metronome'
import { nb } from '../i18n/nb'

interface MetronomeProps {
  bpm: number
  beatsPerBar: number
  onChange: (bpm: number, beatsPerBar: number) => void
  /** Increment to stop the metronome from outside (e.g. when the alarm rings). */
  stopSignal?: number
}

export function Metronome({ bpm, beatsPerBar, onChange, stopSignal = 0 }: MetronomeProps) {
  const [running, setRunning] = useState(false)
  const [activeBeat, setActiveBeat] = useState<number | null>(null)
  const taps = useRef<number[]>([])
  const engine = useRef<MetronomeEngine | null>(null)
  // Latest tempo, updated immediately so fast repeated taps on -/+ never read a stale value.
  const latestBpm = useRef(bpm)
  latestBpm.current = bpm

  engine.current ??= new MetronomeEngine(bpm, beatsPerBar, (beat) => setActiveBeat(beat))

  useEffect(() => engine.current?.setBpm(bpm), [bpm])
  useEffect(() => engine.current?.setBeatsPerBar(beatsPerBar), [beatsPerBar])
  useEffect(() => () => engine.current?.stop(), [])
  useEffect(() => {
    if (stopSignal === 0) return
    engine.current?.stop()
    setRunning(false)
    setActiveBeat(null)
  }, [stopSignal])

  function toggle() {
    if (running) {
      engine.current?.stop()
      setActiveBeat(null)
    } else {
      engine.current?.start()
    }
    setRunning(!running)
  }

  function setBpm(value: number) {
    latestBpm.current = clampBpm(value)
    onChange(latestBpm.current, beatsPerBar)
  }

  const step = (delta: number) => setBpm(latestBpm.current + delta)

  function tap() {
    const now = performance.now()
    const last = taps.current.at(-1)
    taps.current = last !== undefined && now - last > TAP_RESET_MS ? [now] : [...taps.current, now].slice(-6)
    const tempo = tapTempo(taps.current)
    if (tempo !== null) setBpm(tempo)
  }

  return (
    <section className="card metronome" aria-label={nb.metronome}>
      <h3>
        {nb.emoji.drum} {nb.metronome}
      </h3>

      <div className="metronome__beats" aria-hidden="true">
        {Array.from({ length: beatsPerBar }, (_, i) => (
          <span
            key={i}
            className={`beat${i === 0 ? ' beat--accent' : ''}${activeBeat === i ? ' beat--on' : ''}`}
          />
        ))}
      </div>

      <div className="metronome__tempo">
        <button type="button" className="round" onClick={() => step(-1)} aria-label={nb.slower}>
          {'\u2212'}
        </button>
        <p className="metronome__bpm" aria-live="polite">
          <span className="metronome__number">{bpm}</span>
          <span className="metronome__unit">{nb.bpm}</span>
        </p>
        <button type="button" className="round" onClick={() => step(1)} aria-label={nb.faster}>
          +
        </button>
      </div>
      <p className="metronome__name">{nb.tempoName(bpm)}</p>

      <input
        className="metronome__slider"
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        onChange={(event) => setBpm(Number(event.target.value))}
        aria-label={nb.bpm}
      />

      <div className="metronome__row">
        <div className="chips" role="group" aria-label={nb.beatsPerBar}>
          {BEATS_PER_BAR_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className="chip chip--small"
              aria-pressed={n === beatsPerBar}
              onClick={() => onChange(bpm, n)}
            >
              {n}/4
            </button>
          ))}
        </div>
        <button type="button" className="button button--ghost-dark" onClick={tap} title={nb.tapHint}>
          {nb.tap}
        </button>
      </div>

      <button
        type="button"
        className={`button button--big ${running ? 'button--danger' : 'button--primary'}`}
        onClick={toggle}
      >
        {running ? `${nb.emoji.stop} ${nb.stopMetronome}` : `${nb.emoji.play} ${nb.startMetronome}`}
      </button>
    </section>
  )
}
