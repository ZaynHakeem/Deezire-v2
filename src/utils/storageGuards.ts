import { LastQueryState, MoodType, ModeType, SearchResult, Track } from "../types";

const MOODS: MoodType[] = [
  "Heartbroken",
  "Anxious",
  "Happy",
  "Energetic",
  "Focused",
  "Nostalgic",
  "Angry",
  "Peaceful",
];

function isMood(value: unknown): value is MoodType {
  return typeof value === "string" && (MOODS as string[]).includes(value);
}

function isMode(value: unknown): value is ModeType {
  return value === "feel" || value === "shift";
}

export function isValidTrack(value: unknown): value is Track {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  if (typeof t.id !== "number" || typeof t.title !== "string") return false;
  if (typeof t.duration !== "number" || typeof t.preview !== "string") return false;
  const artist = t.artist as Record<string, unknown> | undefined;
  const album = t.album as Record<string, unknown> | undefined;
  if (!artist || typeof artist.name !== "string") return false;
  if (!album || typeof album.title !== "string") return false;
  return true;
}

export function parseLikedSongs(raw: string | null): Track[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTrack);
  } catch {
    return [];
  }
}

export function parseSearchResult(raw: string | null): SearchResult | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.tracks) || !parsed.tracks.every(isValidTrack)) return null;
    if (!isMood(parsed.mood) || !isMode(parsed.mode)) return null;
    if (typeof parsed.rawText !== "string" || typeof parsed.queryUsed !== "string") return null;
    if (typeof parsed.timestamp !== "number") return null;
    return parsed as unknown as SearchResult;
  } catch {
    return null;
  }
}

export function parseLastQuery(raw: string | null): LastQueryState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.rawText !== "string") return null;
    if (!isMood(parsed.mood) || !isMode(parsed.mode)) return null;
    return parsed as unknown as LastQueryState;
  } catch {
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`localStorage.setItem failed for ${key}:`, e);
    return false;
  }
}

export function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`localStorage.removeItem failed for ${key}:`, e);
  }
}
