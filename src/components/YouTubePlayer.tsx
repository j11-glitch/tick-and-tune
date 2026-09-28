import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface PlayerHandle {
  play: () => void
  pause: () => void
}

interface YouTubePlayerProps {
  videoId: string
  title: string
  /** Start playing right away, and whenever the video changes. */
  autoplay: boolean
  onEnded: () => void
  /** Reports whether the video is playing; used to show a hint if autoplay was blocked. */
  onPlayingChange?: (playing: boolean) => void
}

const ENDED = 0
const PLAYING = 1
let apiPromise: Promise<typeof YT> | null = null

/** Loads the YouTube IFrame API script once. */
function loadYouTubeApi(): Promise<typeof YT> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  apiPromise ??= new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT!)
    }
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.onerror = () => reject(new Error('Could not load the YouTube player.'))
    document.head.appendChild(script)
  })
  return apiPromise
}

/** Embedded YouTube player (privacy-enhanced youtube-nocookie.com host). */
export const YouTubePlayer = forwardRef<PlayerHandle, YouTubePlayerProps>(function YouTubePlayer(
  { videoId, title, autoplay, onEnded, onPlayingChange },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const readyRef = useRef(false)
  const onEndedRef = useRef(onEnded)
  const onPlayingRef = useRef(onPlayingChange)
  const autoplayRef = useRef(autoplay)
  const firstVideo = useRef(videoId)
  onEndedRef.current = onEnded
  onPlayingRef.current = onPlayingChange
  autoplayRef.current = autoplay

  useImperativeHandle(ref, () => ({
    play: () => readyRef.current && playerRef.current?.playVideo(),
    pause: () => readyRef.current && playerRef.current?.pauseVideo(),
  }))

  // Create the player once. The API replaces the element it is given, so we hand it a
  // child element that React does not manage.
  useEffect(() => {
    let cancelled = false
    const mount = document.createElement('div')
    hostRef.current?.appendChild(mount)
    loadYouTubeApi()
      .then((api) => {
        if (cancelled) return
        playerRef.current = new api.Player(mount, {
          host: 'https://www.youtube-nocookie.com',
          videoId: firstVideo.current,
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1, autoplay: autoplayRef.current ? 1 : 0 },
          events: {
            onReady: (event) => {
              readyRef.current = true
              // Also ask explicitly: some browsers ignore the autoplay parameter.
              if (autoplayRef.current) event.target.playVideo()
            },
            onStateChange: (event) => {
              onPlayingRef.current?.(event.data === PLAYING)
              if (event.data === ENDED) onEndedRef.current()
            },
          },
        })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
      readyRef.current = false
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !readyRef.current) return
    if (autoplay) player.loadVideoById(videoId)
    else player.cueVideoById(videoId)
  }, [videoId, autoplay])

  return <div className="player" ref={hostRef} role="region" aria-label={title} />
})
