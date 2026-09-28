import { describe, expect, it } from 'vitest'
import songBook from '../data/songs.json'
import { clampBpm, isAccent, secondsPerBeat, tapTempo } from './metronome'
import { nextIndex, previousIndex } from './playlist'
import { songsFor, validateSongBook, type SongBook } from './songs'
import {
  extendTimer,
  formatClock,
  isTimeUp,
  pauseTimer,
  progress,
  remainingMs,
  resumeTimer,
  startTimer,
} from './timer'
import { parseYouTubeId } from './youtube'

describe('parseYouTubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=GG5coCBGJRo', 'GG5coCBGJRo'],
    ['https://youtube.com/watch?v=-u3LdHEJUV8&t=42s', '-u3LdHEJUV8'],
    ['https://youtu.be/fSH1yLZuN0E?si=abc', 'fSH1yLZuN0E'],
    ['https://www.youtube.com/shorts/LP3aUTTnCuA', 'LP3aUTTnCuA'],
    ['https://www.youtube-nocookie.com/embed/a6pB8DOOoVw', 'a6pB8DOOoVw'],
    ['https://m.youtube.com/watch?v=GG5coCBGJRo', 'GG5coCBGJRo'],
    ['GG5coCBGJRo', 'GG5coCBGJRo'],
  ])('%s -> %s', (link, id) => {
    expect(parseYouTubeId(link)).toBe(id)
  })

  it.each(['', 'not a link', 'https://vimeo.com/123', 'https://www.youtube.com/watch?v=short'])('rejects %s', (link) => {
    expect(parseYouTubeId(link)).toBeNull()
  })
})

describe('song book', () => {
  it('is valid (ids, titles, links, children)', () => {
    expect(validateSongBook(songBook)).toEqual([])
  })

  it('lists the songs of one child', () => {
    const ids = songsFor(songBook, 'simo').map((s) => s.id)
    expect(ids).toContain('twinkle')
    expect(ids).not.toContain('ode-to-joy-solo')
  })

  it('reports problems', () => {
    const broken: SongBook = {
      children: [{ id: 'simo', name: 'Simo', color: '#000' }],
      songs: [
        { id: 'a', title: '', youtube: 'nope', children: ['bob'] },
        { id: 'a', title: 'B', youtube: 'GG5coCBGJRo', children: [] },
      ],
    }
    expect(validateSongBook(broken)).toEqual([
      'song "a": missing title',
      'song "a": not a valid YouTube link: nope',
      'song "a": unknown child "bob"',
      'song "a": duplicate id',
      'song "a": no children',
    ])
  })
})

describe('practice timer', () => {
  const t0 = 1_000_000

  it('counts down from the chosen minutes', () => {
    const timer = startTimer(20, t0)
    expect(remainingMs(timer, t0)).toBe(20 * 60_000)
    expect(remainingMs(timer, t0 + 60_000)).toBe(19 * 60_000)
    expect(isTimeUp(timer, t0 + 20 * 60_000)).toBe(true)
    expect(remainingMs(timer, t0 + 25 * 60_000)).toBe(0)
  })

  it('stops counting while paused', () => {
    const paused = pauseTimer(startTimer(10, t0), t0 + 60_000)
    expect(remainingMs(paused, t0 + 5 * 60_000)).toBe(9 * 60_000)
    const resumed = resumeTimer(paused, t0 + 5 * 60_000)
    expect(remainingMs(resumed, t0 + 6 * 60_000)).toBe(8 * 60_000)
  })

  it('can add minutes after the alarm', () => {
    const done = startTimer(10, t0)
    const extended = extendTimer(done, 5, t0 + 10 * 60_000)
    expect(remainingMs(extended, t0 + 10 * 60_000)).toBe(5 * 60_000)
    expect(extended.durationMs).toBe(15 * 60_000)
  })

  it('reports progress', () => {
    const timer = startTimer(10, t0)
    expect(progress(timer, t0 + 5 * 60_000)).toBe(0.5)
  })

  it('formats the clock and only shows 0:00 at the very end', () => {
    expect(formatClock(20 * 60_000)).toBe('20:00')
    expect(formatClock(65_000)).toBe('1:05')
    expect(formatClock(400)).toBe('0:01')
    expect(formatClock(0)).toBe('0:00')
  })
})

describe('playlist', () => {
  it('wraps around both ways', () => {
    expect(nextIndex(0, 3)).toBe(1)
    expect(nextIndex(2, 3)).toBe(0)
    expect(previousIndex(0, 3)).toBe(2)
    expect(nextIndex(0, 0)).toBe(0)
  })
})

describe('metronome', () => {
  it('keeps the BPM in range', () => {
    expect(clampBpm(20)).toBe(40)
    expect(clampBpm(300)).toBe(208)
    expect(clampBpm(92.4)).toBe(92)
    expect(clampBpm(Number.NaN)).toBe(80)
  })

  it('converts BPM to seconds per beat', () => {
    expect(secondsPerBeat(60)).toBe(1)
    expect(secondsPerBeat(120)).toBe(0.5)
  })

  it('accents the first beat of each bar', () => {
    expect([0, 1, 2, 3, 4].map((b) => isAccent(b, 4))).toEqual([true, false, false, false, true])
    expect([0, 1, 2, 3].map((b) => isAccent(b, 3))).toEqual([true, false, false, true])
  })

  it('calculates tap tempo from the latest run of taps', () => {
    expect(tapTempo([0])).toBeNull()
    expect(tapTempo([0, 500, 1000, 1500])).toBe(120)
    // A long pause starts a new measurement.
    expect(tapTempo([0, 500, 10_000, 10_750, 11_500])).toBe(80)
    expect(tapTempo([0, 500, 10_000])).toBeNull()
  })
})
