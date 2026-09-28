import { useCallback, useEffect, useRef, useState } from 'react'
import { playAlarm } from '../audio/alarm'
import { nextIndex, previousIndex } from '../domain/playlist'
import type { Child, Song } from '../domain/songs'
import {
  extendTimer,
  formatClock,
  isTimeUp,
  pauseTimer,
  progress,
  remainingMs,
  resumeTimer,
  startTimer,
  type TimerState,
} from '../domain/timer'
import { parseYouTubeId } from '../domain/youtube'
import { nb } from '../i18n/nb'
import { useWakeLock } from '../useWakeLock'
import { Avatar } from './Avatar'
import { Metronome } from './Metronome'
import { TimeUpDialog } from './TimeUpDialog'
import { YouTubePlayer, type PlayerHandle } from './YouTubePlayer'

interface PracticeSessionProps {
  child: Child
  songs: readonly Song[]
  minutes: number
  bpm: number
  beatsPerBar: number
  onMetronomeChange: (bpm: number, beatsPerBar: number) => void
  onExit: () => void
}

const RING_RADIUS = 54
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

export function PracticeSession(props: PracticeSessionProps) {
  const { child, songs, minutes, bpm, beatsPerBar, onMetronomeChange, onExit } = props
  const [timer, setTimer] = useState<TimerState>(() => startTimer(minutes, Date.now()))
  const [now, setNow] = useState(() => Date.now())
  const [index, setIndex] = useState(0)
  // "Start practice" also starts the first song.
  const [autoplay, setAutoplay] = useState(true)
  // Index of the song whose video has started playing (null = not yet).
  const [startedIndex, setStartedIndex] = useState<number | null>(null)
  const [showPlayHint, setShowPlayHint] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [stopSignal, setStopSignal] = useState(0)
  const player = useRef<PlayerHandle>(null)
  const stopAlarm = useRef<(() => void) | null>(null)

  const silenceAlarm = useCallback(() => {
    stopAlarm.current?.()
    stopAlarm.current = null
  }, [])

  // Tick a few times per second; the timer itself is based on absolute time.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (timeUp || timer.status !== 'running' || !isTimeUp(timer, now)) return
    setTimeUp(true)
    player.current?.pause()
    setStopSignal((s) => s + 1)
    stopAlarm.current = playAlarm()
  }, [now, timer, timeUp])

  useEffect(() => silenceAlarm, [silenceAlarm])

  // If the browser blocked autoplay (common on iPhone), tell the child how to start the video.
  // Only for a song that never started, not when a child pauses the video on purpose.
  const songStarted = startedIndex === index
  useEffect(() => {
    if (songStarted || timer.status !== 'running' || timeUp) {
      setShowPlayHint(false)
      return
    }
    const id = setTimeout(() => setShowPlayHint(true), 2500)
    return () => clearTimeout(id)
  }, [songStarted, timer.status, timeUp])
  useWakeLock(timer.status === 'running' && !timeUp)

  const song = songs[index]
  const videoId = parseYouTubeId(song.youtube) ?? ''
  const left = remainingMs(timer, now)
  const paused = timer.status === 'paused'

  function goTo(nextSong: number) {
    setAutoplay(true)
    setIndex(nextSong)
  }

  function togglePause() {
    if (paused) {
      setTimer(resumeTimer(timer, Date.now()))
      player.current?.play()
    } else {
      setTimer(pauseTimer(timer, Date.now()))
      player.current?.pause()
      setStopSignal((s) => s + 1)
    }
  }

  function stop() {
    if (window.confirm(nb.stopConfirm)) {
      silenceAlarm()
      onExit()
    }
  }

  function moreTime() {
    silenceAlarm()
    setTimer(extendTimer(timer, 5, Date.now()))
    setTimeUp(false)
    player.current?.play()
  }

  return (
    <section className="session">
      <div className="session__main">
        <div className="card timer">
          <div className="timer__ring">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="timer__track" cx="60" cy="60" r={RING_RADIUS} />
              <circle
                className="timer__progress"
                cx="60"
                cy="60"
                r={RING_RADIUS}
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH * progress(timer, now)}
              />
            </svg>
            <div className="timer__text">
              <span className="timer__label">{nb.timeLeft}</span>
              <span className="timer__clock" role="timer" aria-live="off">
                {formatClock(left)}
              </span>
            </div>
          </div>
          <div className="timer__side">
            <div className="timer__who">
              <Avatar child={child} size="sm" />
              <strong>{child.name}</strong>
            </div>
            {paused && <p className="timer__paused">{nb.pausedNote}</p>}
            <div className="timer__buttons">
              <button type="button" className="button button--primary" onClick={togglePause} disabled={timeUp}>
                {paused ? `${nb.emoji.play} ${nb.resume}` : `${nb.emoji.pause} ${nb.pause}`}
              </button>
              <button type="button" className="button button--ghost-dark" onClick={stop}>
                {nb.emoji.stop} {nb.stop}
              </button>
            </div>
          </div>
        </div>

        <div className="card now-playing">
          <div className="card__header">
            <h3>
              {nb.emoji.note} {song.title}
            </h3>
            <span className="muted small">{nb.songOf(index + 1, songs.length)}</span>
          </div>
          {showPlayHint && (
            <div className="play-hint" role="status">
              <span>{nb.playHint}</span>
              <button type="button" className="button button--primary" onClick={() => player.current?.play()}>
                {nb.emoji.play} {nb.playVideo}
              </button>
            </div>
          )}
          <div className="player-frame">
            <YouTubePlayer
              ref={player}
              videoId={videoId}
              title={song.title}
              autoplay={autoplay}
              onEnded={() => goTo(nextIndex(index, songs.length))}
              onPlayingChange={(playing) => playing && setStartedIndex(index)}
            />
          </div>
          {songs.length > 1 && (
            <>
              <div className="now-playing__controls">
                <button type="button" className="button button--ghost-dark" onClick={() => goTo(previousIndex(index, songs.length))}>
                  {nb.emoji.previous} {nb.previous}
                </button>
                <button type="button" className="button button--ghost-dark" onClick={() => goTo(nextIndex(index, songs.length))}>
                  {nb.next} {nb.emoji.next}
                </button>
              </div>
              <h4 className="playlist__title">{nb.playlist}</h4>
              <ol className="playlist">
                {songs.map((s, i) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`playlist__item${i === index ? ' playlist__item--current' : ''}`}
                      aria-current={i === index}
                      onClick={() => goTo(i)}
                    >
                      <span className="playlist__number">{i + 1}</span>
                      {s.title}
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>

      <Metronome bpm={bpm} beatsPerBar={beatsPerBar} onChange={onMetronomeChange} stopSignal={stopSignal} />

      {timeUp && <TimeUpDialog minutes={Math.round(timer.durationMs / 60_000)} onMore={moreTime} onDone={() => { silenceAlarm(); onExit() }} />}
    </section>
  )
}
