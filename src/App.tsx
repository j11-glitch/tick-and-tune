import { useEffect, useState } from 'react'
import { unlockAudio } from './audio/audioContext'
import { Avatar } from './components/Avatar'
import { ChildPicker } from './components/ChildPicker'
import { Metronome } from './components/Metronome'
import { PracticeSession } from './components/PracticeSession'
import { PracticeSetup } from './components/PracticeSetup'
import songBook from './data/songs.json'
import { songsFor, type Song, type SongBook } from './domain/songs'
import { DEFAULT_MINUTES } from './domain/timer'
import { nb } from './i18n/nb'
import { loadPreferences, savePreferences, type Preferences } from './storage'

const book: SongBook = songBook
const ICON_URL = `${import.meta.env.BASE_URL}icon-192.png`

type Screen =
  | { name: 'home' }
  | { name: 'metronome' }
  | { name: 'setup'; childId: string }
  | { name: 'practice'; childId: string; songs: Song[]; minutes: number }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences)

  useEffect(() => savePreferences(prefs), [prefs])

  const child = 'childId' in screen ? book.children.find((c) => c.id === screen.childId) : undefined
  const setMetronome = (bpm: number, beatsPerBar: number) => setPrefs((p) => ({ ...p, bpm, beatsPerBar }))

  return (
    <div className="app">
      <header className="header">
        <img className="header__logo" src={ICON_URL} alt="" width={60} height={60} />
        <div>
          <h1>
            Tick <span className="amp">&amp;</span>{' '}Tune
          </h1>
          <p className="header__tagline">
            {nb.emoji.notes} {nb.tagline}
          </p>
        </div>
        {screen.name !== 'home' && screen.name !== 'practice' && (
          <button
            type="button"
            className="button button--ghost header__back"
            onClick={() => setScreen({ name: 'home' })}
            aria-label={nb.back}
          >
            {'\u2190'} <span className="header__back-label">{nb.back}</span>
          </button>
        )}
        {screen.name === 'practice' && child && (
          <span className="header__child">
            <Avatar child={child} size="sm" />
          </span>
        )}
      </header>

      <main>
        {screen.name === 'home' && (
          <ChildPicker
            kids={book.children}
            songCount={(id) => songsFor(book, id).length}
            onPick={(childId) => setScreen({ name: 'setup', childId })}
            onMetronome={() => setScreen({ name: 'metronome' })}
          />
        )}

        {screen.name === 'metronome' && (
          <div className="metronome-page">
            <Metronome bpm={prefs.bpm} beatsPerBar={prefs.beatsPerBar} onChange={setMetronome} />
          </div>
        )}

        {screen.name === 'setup' && child && (
          <PracticeSetup
            child={child}
            songs={songsFor(book, child.id)}
            initialSelection={prefs.songs[child.id] ?? []}
            initialMinutes={prefs.minutes[child.id] ?? DEFAULT_MINUTES}
            onStart={(songs, minutes) => {
              unlockAudio() // inside the click, so the alarm is allowed to play later
              setPrefs((p) => ({
                ...p,
                songs: { ...p.songs, [child.id]: songs.map((s) => s.id) },
                minutes: { ...p.minutes, [child.id]: minutes },
              }))
              setScreen({ name: 'practice', childId: child.id, songs, minutes })
            }}
          />
        )}

        {screen.name === 'practice' && child && (
          <PracticeSession
            child={child}
            songs={screen.songs}
            minutes={screen.minutes}
            bpm={prefs.bpm}
            beatsPerBar={prefs.beatsPerBar}
            onMetronomeChange={setMetronome}
            onExit={() => setScreen({ name: 'setup', childId: child.id })}
          />
        )}
      </main>
    </div>
  )
}
