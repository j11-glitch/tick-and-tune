import { useEffect, useRef } from 'react'
import { nb } from '../i18n/nb'

interface TimeUpDialogProps {
  minutes: number
  onMore: () => void
  onDone: () => void
}

export function TimeUpDialog({ minutes, onMore, onDone }: TimeUpDialogProps) {
  const doneButton = useRef<HTMLButtonElement>(null)
  useEffect(() => doneButton.current?.focus(), [])

  return (
    <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="time-up-title">
      <div className="dialog__card">
        <p className="dialog__icon" aria-hidden="true">
          {nb.emoji.alarm}
        </p>
        <h2 id="time-up-title">{nb.timeUpTitle}</h2>
        <p className="dialog__stars" aria-hidden="true">
          {nb.emoji.star}
          {nb.emoji.star}
          {nb.emoji.star}
        </p>
        <p>{nb.timeUpText(minutes)}</p>
        <div className="dialog__actions">
          <button ref={doneButton} type="button" className="button button--primary" onClick={onDone}>
            {nb.emoji.party} {nb.done}
          </button>
          <button type="button" className="button button--ghost-dark" onClick={onMore}>
            {nb.moreMinutes}
          </button>
        </div>
      </div>
    </div>
  )
}
