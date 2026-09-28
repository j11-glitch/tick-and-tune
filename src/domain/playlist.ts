/** Next song, wrapping to the first so practice continues until the time is up. */
export function nextIndex(index: number, count: number): number {
  return count === 0 ? 0 : (index + 1) % count
}

export function previousIndex(index: number, count: number): number {
  return count === 0 ? 0 : (index - 1 + count) % count
}
