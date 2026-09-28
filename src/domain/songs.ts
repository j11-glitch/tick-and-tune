import { parseYouTubeId } from './youtube'

export interface Child {
  readonly id: string
  readonly name: string
  /** Colour of the child's avatar circle. */
  readonly color: string
}

export interface Song {
  readonly id: string
  readonly title: string
  /** Any YouTube link (or bare video id). */
  readonly youtube: string
  /** Ids of the children who practise this song. */
  readonly children: readonly string[]
  readonly note?: string
}

export interface SongBook {
  readonly children: readonly Child[]
  readonly songs: readonly Song[]
}

export function songsFor(book: SongBook, childId: string): Song[] {
  return book.songs.filter((song) => song.children.includes(childId))
}

/** Problems in the song book (empty when valid). Guarded by tests so a bad link never ships. */
export function validateSongBook(book: SongBook): string[] {
  const errors: string[] = []
  const childIds = new Set(book.children.map((c) => c.id))
  if (childIds.size !== book.children.length) errors.push('child ids must be unique')
  const songIds = new Set<string>()
  for (const song of book.songs) {
    const where = `song "${song.id}"`
    if (songIds.has(song.id)) errors.push(`${where}: duplicate id`)
    songIds.add(song.id)
    if (!song.title?.trim()) errors.push(`${where}: missing title`)
    if (!parseYouTubeId(song.youtube ?? '')) errors.push(`${where}: not a valid YouTube link: ${song.youtube}`)
    if (!song.children?.length) errors.push(`${where}: no children`)
    for (const id of song.children ?? []) {
      if (!childIds.has(id)) errors.push(`${where}: unknown child "${id}"`)
    }
  }
  return errors
}
