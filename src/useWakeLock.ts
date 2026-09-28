import { useEffect } from 'react'

/** Keeps the screen on while `active` (so the alarm can sound), where the browser supports it. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let released = false
    const request = () => {
      navigator.wakeLock
        .request('screen')
        .then((sentinel) => {
          if (released) void sentinel.release()
          else lock = sentinel
        })
        .catch(() => undefined)
    }
    // The lock is dropped when the page is hidden; take it again when it comes back.
    const onVisible = () => document.visibilityState === 'visible' && request()
    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release()
    }
  }, [active])
}
