// All text the children see, in Norwegian Bokmål. Emoji live here too.

export const nb = {
  appName: 'Tick & Tune',
  tagline: 'Øv med takt og tone',

  whoPractises: 'Hvem skal øve i dag?',
  songCount: (count: number) => (count === 1 ? '1 sang' : `${count} sanger`),
  justMetronome: 'Bare metronom',

  back: 'Tilbake',
  songsFor: (name: string) => `Sangene til ${name}`,
  chooseSongs: 'Velg sangene du vil øve på',
  selectAll: 'Velg alle',
  clearAll: 'Fjern alle',
  selected: (count: number) => `${count} valgt`,
  noSongs: 'Ingen sanger ennå. Be en voksen legge til sanger.',
  practiceTime: 'Hvor lenge vil du øve?',
  minutes: (minutes: number) => `${minutes} min`,
  startPractice: 'Start øving',
  pickAtLeastOne: 'Velg minst én sang først.',

  timeLeft: 'Tid igjen',
  pause: 'Pause',
  resume: 'Fortsett',
  stop: 'Avslutt',
  stopConfirm: 'Vil du avslutte øvingen nå?',
  pausedNote: 'Pause. Trykk «Fortsett» når du er klar.',
  songOf: (index: number, total: number) => `Sang ${index} av ${total}`,
  previous: 'Forrige',
  next: 'Neste',
  playlist: 'Spilleliste',
  playHint: 'Videoen startet ikke av seg selv. Trykk på ▶ i videoen, eller her:',
  playVideo: 'Spill av',

  metronome: 'Metronom',
  bpm: 'BPM',
  slower: 'Saktere',
  faster: 'Raskere',
  tap: 'Tapp takten',
  tapHint: 'Tapp i takt noen ganger for å sette tempoet.',
  beatsPerBar: 'Slag per takt',
  startMetronome: 'Start',
  stopMetronome: 'Stopp',
  tempoName: (bpm: number) =>
    bpm < 60
      ? 'Largo (veldig langsomt)'
      : bpm < 76
        ? 'Adagio (langsomt)'
        : bpm < 108
          ? 'Andante (gående)'
          : bpm < 120
            ? 'Moderato (middels)'
            : bpm < 156
              ? 'Allegro (raskt)'
              : bpm < 176
                ? 'Vivace (livlig)'
                : 'Presto (veldig raskt)',

  timeUpTitle: 'Tiden er ute!',
  timeUpText: (minutes: number) => `Du har øvd i ${minutes} minutter. Kjempebra jobbet!`,
  moreMinutes: '5 minutter til',
  done: 'Ferdig',

  emoji: {
    notes: '🎶',
    note: '🎵',
    drum: '🥁',
    timer: '⏱️',
    alarm: '⏰',
    party: '🎉',
    play: '▶️',
    pause: '⏸️',
    stop: '⏹️',
    previous: '⏮️',
    next: '⏭️',
    star: '⭐',
  },
} as const
