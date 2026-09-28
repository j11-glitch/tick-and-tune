const ID = /^[A-Za-z0-9_-]{11}$/

/**
 * Extracts the 11-character video id from any common YouTube link
 * (watch?v=, youtu.be/, /shorts/, /embed/, /live/) or from a bare id.
 */
export function parseYouTubeId(link: string): string | null {
  const text = link.trim()
  if (ID.test(text)) return text
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '')
  let candidate: string | null = null
  if (host === 'youtu.be') {
    candidate = url.pathname.split('/')[1] ?? null
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    candidate = url.searchParams.get('v')
    const match = /^\/(?:shorts|embed|live|v)\/([^/?#]+)/.exec(url.pathname)
    if (!candidate && match) candidate = match[1]
  }
  return candidate && ID.test(candidate) ? candidate : null
}
