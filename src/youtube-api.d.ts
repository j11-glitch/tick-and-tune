// Minimal types for the YouTube IFrame Player API (https://developers.google.com/youtube/iframe_api_reference).
declare namespace YT {
  interface PlayerEvent {
    target: Player
  }
  interface OnStateChangeEvent extends PlayerEvent {
    data: number
  }
  interface PlayerOptions {
    videoId?: string
    host?: string
    width?: string | number
    height?: string | number
    playerVars?: Record<string, string | number>
    events?: {
      onReady?: (event: PlayerEvent) => void
      onStateChange?: (event: OnStateChangeEvent) => void
    }
  }
  class Player {
    constructor(element: HTMLElement, options: PlayerOptions)
    loadVideoById(videoId: string): void
    cueVideoById(videoId: string): void
    playVideo(): void
    pauseVideo(): void
    destroy(): void
  }
}

interface Window {
  YT?: typeof YT
  onYouTubeIframeAPIReady?: () => void
}
