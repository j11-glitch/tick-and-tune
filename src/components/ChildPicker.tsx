import type { Child } from '../domain/songs'
import { nb } from '../i18n/nb'
import { Avatar } from './Avatar'

interface ChildPickerProps {
  kids: readonly Child[]
  songCount: (childId: string) => number
  onPick: (childId: string) => void
  onMetronome: () => void
}

export function ChildPicker({ kids, songCount, onPick, onMetronome }: ChildPickerProps) {
  return (
    <section className="picker">
      <h2 className="picker__title">{nb.whoPractises}</h2>
      <div className="picker__cards">
        {kids.map((child) => (
          <button key={child.id} type="button" className="child-card" onClick={() => onPick(child.id)}>
            <Avatar child={child} size="lg" />
            <span className="child-card__name">{child.name}</span>
            <span className="child-card__songs">
              {nb.emoji.notes} {nb.songCount(songCount(child.id))}
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="button button--ghost picker__metronome" onClick={onMetronome}>
        {nb.emoji.drum} {nb.justMetronome}
      </button>
    </section>
  )
}
