# Tick & Tune

*Øv med takt og tone* (practise with beat and tone).

A small web app for children's clarinet practice: pick songs from YouTube, choose how long to
practise, and play along with a metronome. An alarm rings when the practice time is up.
The app speaks Norwegian; code and documentation are in English.

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

| Script          | What it does                                  |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Start the dev server                          |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm test`      | Run the tests (including the song list)       |

## How it works

1. **Choose a child** on the start page (or open **Bare metronom** for just the metronome).
2. **Choose songs** (one or more) and the **practice time**: 10, 15, 20 (default), 25, 30 or
   45 minutes. The choices are remembered for next time.
3. **Practise.** The screen shows:
   - a countdown with **Pause**/**Fortsett** and **Avslutt**;
   - the YouTube player, which starts the first song right away, with the chosen songs in
     order, **Forrige**/**Neste**, and a playlist; when a song ends the next one starts, and
     after the last song it starts over. If the browser blocks autoplay (possible on iPhone),
     a hint with a **Spill av** button appears above the video;
   - the metronome.
4. **Time is up:** an alarm chime rings (and the phone vibrates on Android), the video and
   metronome stop, and a dialog offers **Ferdig** or **5 minutter til**.

The screen is kept awake during practice (Screen Wake Lock) where the browser supports it,
so the alarm can ring. If a phone is locked anyway, the alarm sounds when the app is opened
again, because the countdown uses the real clock.

### Metronome

- 40–208 BPM with a slider and −/+ buttons, plus **Tapp takten** (tap tempo).
- 2/4, 3/4 or 4/4 with an accented first beat and a flashing beat light.
- Clicks are scheduled on the Web Audio clock, so the beat stays steady.
- The tempo and time signature are remembered.

## Adding songs

Songs and children live in [`src/data/songs.json`](src/data/songs.json). Edit it on GitHub
and the site redeploys by itself.

```json
{
  "children": [{ "id": "aurora", "name": "Aurora", "color": "#e8488a" }],
  "songs": [
    {
      "id": "ode-to-joy-solo",
      "title": "Ode to Joy – solo klarinett",
      "youtube": "https://www.youtube.com/watch?v=GG5coCBGJRo",
      "children": ["aurora"],
      "note": "Optional short note shown under the title"
    }
  ]
}
```

- `youtube` can be any normal YouTube link (`watch?v=`, `youtu.be/`, `shorts/`) or a video id.
- `children` lists who practises the song; a song can belong to several children.
- `npm test` checks that ids are unique, every link is a valid YouTube link, and every child
  exists, so a typo fails the deploy instead of breaking the app.
- The video must allow embedding. Most do; if one does not, YouTube shows a message in the
  player.

The example songs are clarinet play-along videos; replace them with the real practice songs.

## Privacy

Videos play through YouTube's privacy-enhanced embed (`youtube-nocookie.com`). Choices and the
metronome settings are stored only in the browser (`localStorage`).

## App icon

`assets/logo-source.png` is the logo. `python3 scripts/generate-icons.py` (needs Pillow) writes
the home-screen icons and favicon into `public/`, using the emblem without the text.

## Project structure

```text
src/
  data/songs.json          Children and songs
  domain/                  Pure logic, unit-tested
    youtube.ts             YouTube link -> video id
    songs.ts               Song book types and validation
    timer.ts               Practice countdown (absolute end time)
    playlist.ts            Next/previous song
    metronome.ts           BPM limits, accents, tap tempo
  audio/                   Web Audio: shared context, metronome engine, alarm
  components/              Screens and widgets (setup, session, metronome, player ...)
  i18n/nb.ts               All Norwegian UI text (and emoji)
  useWakeLock.ts           Keeps the screen on during practice
  storage.ts               Remembered choices in localStorage
  App.tsx                  Screens and navigation
```

## Deployment

Every push to `main` runs the tests, builds the app and publishes it to GitHub Pages via
`.github/workflows/deploy.yml`.
