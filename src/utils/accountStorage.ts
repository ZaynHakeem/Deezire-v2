import { Track } from "../types";
import { parseLikedSongs } from "./storageGuards";

/** Keep the legacy key for guests. Account keys never overwrite guest likes. */
export const likedSongsKey = (userId?: string) =>
  userId
    ? `deezire_liked_songs:user:${encodeURIComponent(userId)}`
    : "deezire_liked_songs";

export function readLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readAccountLikes(key: string): Track[] {
  return parseLikedSongs(readLocalStorage(key));
}
