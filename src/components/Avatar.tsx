import type { CSSProperties } from 'react'
import type { Child } from '../domain/songs'

/** Round avatar with the child's initial in their colour. */
export function Avatar({ child, size = 'md' }: { child: Child; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`avatar avatar--${size}`} style={{ '--avatar-color': child.color } as CSSProperties} aria-hidden="true">
      {child.name.charAt(0).toUpperCase()}
    </span>
  )
}
