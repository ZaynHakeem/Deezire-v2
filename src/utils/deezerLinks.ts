/** Resolve a Deezer track page URL from API link or track id fallback. */
export function getDeezerTrackUrl(track: { id: number; link?: string }): string {
  const link = track.link?.trim();
  return link || `https://www.deezer.com/track/${track.id}`;
}
