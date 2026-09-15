export type MoodType = 
  | "Heartbroken"
  | "Anxious"
  | "Happy"
  | "Energetic"
  | "Focused"
  | "Nostalgic"
  | "Angry"
  | "Peaceful";

export type ModeType = "feel" | "shift";

export interface Artist {
  id: number;
  name: string;
  picture_small?: string;
  picture_medium?: string;
}

export interface Album {
  id: number;
  title: string;
  cover_small?: string;
  cover_medium?: string;
  cover_big?: string;
}

export interface Track {
  id: number;
  title: string;
  title_short?: string;
  artist: Artist;
  album: Album;
  duration: number; // in seconds
  preview: string; // 30-second preview audio URL
  link?: string; // link to Deezer track
  rank?: number;
  explicit_lyrics?: boolean;
}

export interface MoodTheme {
  mood: MoodType;
  emoji: string;
  gradient: string; // Tailwind class string, e.g. "from-blue-600 to-indigo-900"
  textColor: string;
  feelQuery: string;
  shiftQuery: string;
  feelDescription: string;
  shiftDescription: string;
}

export interface SearchResult {
  tracks: Track[];
  mood: MoodType;
  mode: ModeType;
  rawText: string;
  queryUsed: string;
  timestamp: number;
  emotionLabel?: string;
  analyzedQuery?: string;
  analyzedLabel?: string;
}

export interface LastQueryState {
  rawText: string;
  mood: MoodType;
  mode: ModeType;
  emotionLabel?: string;
  analyzedQuery?: string;
  analyzedLabel?: string;
}

/** Loose Deezer playlist search hit (fields we actually read). */
export interface DeezerPlaylistHit {
  id: number | string;
  title?: string;
  nb_tracks?: number;
  user?: { name?: string };
}

/** Loose Deezer track payload (playlist track or nested track). */
export interface DeezerTrackPayload {
  id?: number | string;
  title?: string;
  title_short?: string;
  duration?: number;
  preview?: string;
  link?: string;
  explicit_lyrics?: boolean;
  artist?: {
    id?: number | string;
    name?: string;
    picture_small?: string;
    picture_medium?: string;
  };
  album?: {
    id?: number | string;
    title?: string;
    cover_small?: string;
    cover_medium?: string;
    cover_big?: string;
  };
  track?: DeezerTrackPayload;
}

