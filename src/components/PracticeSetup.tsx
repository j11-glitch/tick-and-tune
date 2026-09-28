import { useState } from 'react'
import type { Child, Song } from '../domain/songs'
import { DURATIONS_MINUTES } from '../domain/timer'
import { nb } from '../i18n/nb'
import { Avatar } from './Avatar'

interface PracticeSetupProps {
  child: Child
  songs: readonly Song[]
  initialSelection: readonly string[]
  initialMinutes: number
  onStart: (songs: Song[], minutes: number) => void
}

/** Pick songs (several, in list order) and the practice time. */
export function PracticeSetup({ child, songs, initialSelection, initialMinutes, onStart }: PracticeSetupProps) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    () => new Set(initialSelection.filter((id) => songs.some((s) => s.id === id))),
  )
  const [minutes, setMinutes] = useState(initialMinutes)
  const [warning, setWarning] = useState(false)
  const allSelected = songs.length > 0 && selected.size === songs.length

  function toggle(id: string) {
    setWarning(false)
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function start() {
    const chosen = songs.filter((s) => selected.has(s.id))
    if (chosen.length === 0) {
      setWarning(true)
      return
    }
    onStart(chosen, minutes)
  }

  return (
    <section className="setup">
      <div className="setup__who">
        <Avatar child={child} />
        <h2>{nb.songsFor(child.name)}</h2>
      </div>

      <div className="card">
        <div className="card__header">
          <h3>
            {nb.emoji.notes} {nb.chooseSongs}
          </h3>
          {songs.length > 0 && (
            <button
              type="button"
              className="link"
              onClick={() => setSelected(allSelected ? new Set() : new Set(songs.map((s) => s.id)))}
            >
              {allSelected ? nb.clearAll : nb.selectAll}
            </button>
          )}
        </div>
        {songs.length === 0 ? (
          <p className="muted">{nb.noSongs}</p>
        ) : (
          <ul className="song-list">
            {songs.map((song) => (
              <li key={song.id}>
                <label className={`song-row${selected.has(song.id) ? ' song-row--selected' : ''}`}>
                  <input type="checkbox" checked={selected.has(song.id)} onChange={() => toggle(song.id)} />
                  <span className="song-row__text">
                    <span className="song-row__title">{song.title}</span>
                    {song.note && <span className="song-row__note">{song.note}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <p className="muted small">{nb.selected(selected.size)}</p>
      </div>

      <div className="card">
        <h3>
          {nb.emoji.timer} {nb.practiceTime}
        </h3>
        <div className="chips" role="group" aria-label={nb.practiceTime}>
          {DURATIONS_MINUTES.map((m) => (
            <button key={m} type="button" className="chip" aria-pressed={m === minutes} onClick={() => setMinutes(m)}>
              {nb.minutes(m)}
            </button>
          ))}
        </div>
      </div>

      {warning && (
        <p className="warning" role="alert">
          {nb.pickAtLeastOne}
        </p>
      )}
      <button type="button" className="button button--primary button--big" onClick={start}>
        {nb.emoji.play} {nb.startPractice}
      </button>
    </section>
  )
}
