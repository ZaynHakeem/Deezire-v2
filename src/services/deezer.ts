import { Track, MoodType, ModeType, DeezerPlaylistHit, DeezerTrackPayload } from "../types";
import { MOOD_THEMES } from "../utils/themes";

const DEEZER_API_BASE = '/api/deezer';

/** Thrown when Deezer HTTP/network fails (distinct from empty catalog). */
export class DeezerNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeezerNetworkError";
  }
}

const SCENARIO_TO_QUERY: Record<string, string> = {
  stressed: 'dark alternative rock intense',
  stress: 'dark alternative rock intense',
  overwhelmed: 'post-rock cinematic heavy',
  anxious: 'dark indie atmospheric tense',
  anxiety: 'dark indie atmospheric tense',
  nervous: 'minimal indie restless',
  sad: 'indie folk piano slow',
  heartbroken: 'acoustic ballad piano emotional',
  depressed: 'dark folk slow minimal',
  lonely: 'ambient indie solitude slow',
  angry: 'hard rock metal aggressive',
  frustrated: 'alternative rock grunge',
  tired: 'lo-fi downtempo slow',
  exhausted: 'ambient downtempo minimal',
  bored: 'indie alternative midtempo',
  lost: 'ambient atmospheric slow',
  empty: 'post-rock ambient minimal',
  grief: 'classical piano slow orchestral',
  hopeless: 'dark folk acoustic slow',
  happy: 'pop upbeat feel good dance',
  excited: 'dance electronic upbeat energetic',
  joyful: 'pop bright upbeat summer',
  euphoric: 'electronic dance edm uplifting',
  energetic: 'hip hop trap high energy',
  motivated: 'hip hop rap power workout',
  confident: 'hip hop rap bold',
  proud: 'pop rock anthemic triumphant',
  grateful: 'acoustic folk warm',
  content: 'indie pop mellow warm',
  peaceful: 'acoustic ambient gentle',
  romantic: 'jazz soul slow romantic',
  loved: 'soul rnb warm slow',
  nostalgic: 'classic rock 80s synth pop',
  focused: 'instrumental classical piano study',
  studying: 'lo-fi hip hop instrumental study',
  working: 'ambient electronic instrumental focus',
  gym: 'hip hop trap workout',
  workout: 'electronic dance edm pump',
  driving: 'rock classic road trip',
  morning: 'acoustic pop fresh upbeat',
  night: 'ambient electronic late night',
  party: 'dance pop edm club',
  chill: 'lo-fi hip hop chill',
  relaxing: 'acoustic ambient soft',
  // Extended negative emotions
  upset: 'indie folk piano slow',
  unhappy: 'indie folk piano slow',
  miserable: 'dark folk slow minimal',
  gloomy: 'dark folk slow minimal',
  down: 'indie folk piano slow',
  low: 'dark folk slow minimal',
  blue: 'indie folk piano slow',
  melancholy: 'indie folk piano slow',
  melancholic: 'indie folk piano slow',
  heartache: 'acoustic ballad piano emotional',
  broken: 'acoustic ballad piano emotional',
  hurt: 'acoustic ballad piano emotional',
  wounded: 'acoustic ballad piano emotional',
  crushed: 'acoustic ballad piano emotional',
  devastated: 'dark folk slow minimal',
  shattered: 'dark folk slow minimal',
  torn: 'acoustic ballad piano emotional',
  numb: 'post-rock ambient minimal',
  hollow: 'post-rock ambient minimal',
  void: 'post-rock ambient minimal',
  dead: 'dark folk slow minimal',
  helpless: 'dark folk acoustic slow',
  worthless: 'dark folk slow minimal',
  insecure: 'dark indie atmospheric tense',
  ashamed: 'dark folk slow minimal',
  guilty: 'dark folk slow minimal',
  embarrassed: 'dark indie atmospheric tense',
  humiliated: 'dark folk slow minimal',
  rejected: 'acoustic ballad piano emotional',
  abandoned: 'ambient indie solitude slow',
  neglected: 'ambient indie solitude slow',
  invisible: 'ambient indie solitude slow',
  isolated: 'ambient indie solitude slow',
  alone: 'ambient indie solitude slow',
  solitude: 'ambient indie solitude slow',
  disconnected: 'ambient indie solitude slow',
  alienated: 'ambient indie solitude slow',
  scared: 'dark indie atmospheric tense',
  afraid: 'dark indie atmospheric tense',
  frightened: 'dark indie atmospheric tense',
  terrified: 'dark indie atmospheric tense',
  paranoid: 'dark indie atmospheric tense',
  panicking: 'dark indie atmospheric tense',
  panic: 'dark indie atmospheric tense',
  worried: 'dark indie atmospheric tense',
  uneasy: 'dark indie atmospheric tense',
  tense: 'dark alternative rock intense',
  restless: 'minimal indie restless',
  agitated: 'alternative rock grunge',
  irritated: 'alternative rock grunge',
  annoyed: 'alternative rock grunge',
  bitter: 'dark folk slow minimal',
  resentful: 'dark alternative rock intense',
  jealous: 'dark indie atmospheric tense',
  envious: 'dark indie atmospheric tense',
  betrayed: 'dark folk slow minimal',
  deceived: 'dark folk slow minimal',
  lied: 'dark folk slow minimal',
  cheated: 'acoustic ballad piano emotional',
  used: 'acoustic ballad piano emotional',
  manipulated: 'dark folk slow minimal',
  trapped: 'post-rock cinematic heavy',
  stuck: 'ambient atmospheric slow',
  confused: 'ambient atmospheric slow',
  overworked: 'lo-fi downtempo slow',
  burnout: 'lo-fi downtempo slow',
  drained: 'ambient downtempo minimal',
  depleted: 'ambient downtempo minimal',
  fatigued: 'lo-fi downtempo slow',
  sleepy: 'lo-fi downtempo slow',
  drowsy: 'lo-fi downtempo slow',
  sluggish: 'lo-fi downtempo slow',
  lazy: 'lo-fi hip hop chill',
  unmotivated: 'ambient downtempo minimal',
  uninspired: 'ambient atmospheric slow',
  apathetic: 'ambient downtempo minimal',
  indifferent: 'ambient downtempo minimal',
  detached: 'ambient atmospheric slow',
  dissociated: 'ambient atmospheric slow',
  grieving: 'classical piano slow orchestral',
  mourning: 'classical piano slow orchestral',
  loss: 'classical piano slow orchestral',
  bereaved: 'classical piano slow orchestral',
  crying: 'acoustic ballad piano emotional',
  tears: 'acoustic ballad piano emotional',
  sobbing: 'acoustic ballad piano emotional',
  weeping: 'acoustic ballad piano emotional',
  depression: 'dark folk slow minimal',
  suicidal: 'dark folk slow minimal',
  dark: 'dark folk slow minimal',
  darkness: 'dark folk slow minimal',
  pain: 'acoustic ballad piano emotional',
  suffering: 'dark folk slow minimal',
  anguish: 'dark folk slow minimal',
  torment: 'dark folk slow minimal',
  despair: 'dark folk slow minimal',
  desperate: 'dark folk slow minimal',
  // Extended positive emotions
  hopeful: 'pop upbeat feel good dance',
  optimistic: 'pop upbeat feel good dance',
  blessed: 'acoustic folk warm',
  thankful: 'acoustic folk warm',
  appreciative: 'acoustic folk warm',
  cherished: 'soul rnb warm slow',
  adored: 'soul rnb warm slow',
  wanted: 'soul rnb warm slow',
  safe: 'acoustic ambient gentle',
  secure: 'acoustic ambient gentle',
  warm: 'acoustic folk warm',
  cozy: 'lo-fi hip hop chill',
  comfortable: 'lo-fi hip hop chill',
  calm: 'acoustic ambient gentle',
  serene: 'acoustic ambient gentle',
  tranquil: 'acoustic ambient gentle',
  zen: 'acoustic ambient gentle',
  balanced: 'acoustic ambient gentle',
  centered: 'acoustic ambient gentle',
  grounded: 'acoustic ambient gentle',
  alive: 'pop upbeat feel good dance',
  vibrant: 'dance electronic upbeat energetic',
  radiant: 'pop bright upbeat summer',
  glowing: 'pop bright upbeat summer',
  beaming: 'pop bright upbeat summer',
  thriving: 'pop upbeat feel good dance',
  flourishing: 'pop upbeat feel good dance',
  unstoppable: 'hip hop rap power workout',
  invincible: 'hip hop rap power workout',
  powerful: 'hip hop rap bold',
  strong: 'hip hop rap power workout',
  fearless: 'hip hop rap bold',
  brave: 'pop rock anthemic triumphant',
  courageous: 'pop rock anthemic triumphant',
  determined: 'hip hop rap power workout',
  driven: 'hip hop trap high energy',
  ambitious: 'hip hop rap power workout',
  inspired: 'pop upbeat feel good dance',
  creative: 'indie alternative midtempo',
  imaginative: 'indie alternative midtempo',
  curious: 'indie alternative midtempo',
  adventurous: 'rock classic road trip',
  spontaneous: 'dance electronic upbeat energetic',
  free: 'pop upbeat feel good dance',
  liberated: 'pop upbeat feel good dance',
  relieved: 'acoustic folk warm',
  vindicated: 'pop rock anthemic triumphant',
  accomplished: 'pop rock anthemic triumphant',
  successful: 'pop rock anthemic triumphant',
  victorious: 'pop rock anthemic triumphant',
  triumphant: 'pop rock anthemic triumphant',
  winning: 'hip hop rap bold',
  celebrating: 'dance pop edm club',
  festive: 'dance pop edm club',
  playful: 'pop bright upbeat summer',
  silly: 'pop bright upbeat summer',
  goofy: 'pop bright upbeat summer',
  fun: 'pop bright upbeat summer',
  carefree: 'pop bright upbeat summer',
  lighthearted: 'indie pop mellow warm',
  easygoing: 'lo-fi hip hop chill',
  mellow: 'lo-fi hip hop chill',
  // Relationship emotions
  inlove: 'jazz soul slow romantic',
  infatuated: 'jazz soul slow romantic',
  smitten: 'jazz soul slow romantic',
  crushing: 'jazz soul slow romantic',
  flirty: 'jazz soul slow romantic',
  passionate: 'jazz soul slow romantic',
  sensual: 'jazz soul slow romantic',
  intimate: 'jazz soul slow romantic',
  tender: 'soul rnb warm slow',
  affectionate: 'soul rnb warm slow',
  // Social emotions
  homesick: 'acoustic folk warm',
  sentimental: 'classic rock 80s synth pop',
  reminiscing: 'classic rock 80s synth pop',
  throwback: 'classic rock 80s synth pop',
  missing: 'acoustic ballad piano emotional',
  longing: 'acoustic ballad piano emotional',
  yearning: 'acoustic ballad piano emotional',
  pining: 'acoustic ballad piano emotional',
  // Activity and context
  waking: 'acoustic pop fresh upbeat',
  sunrise: 'acoustic pop fresh upbeat',
  breakfast: 'acoustic pop fresh upbeat',
  commute: 'rock classic road trip',
  traveling: 'rock classic road trip',
  roadtrip: 'rock classic road trip',
  flying: 'ambient electronic late night',
  vacation: 'pop bright upbeat summer',
  beach: 'pop bright upbeat summer',
  summer: 'pop bright upbeat summer',
  winter: 'acoustic ambient gentle',
  rain: 'lo-fi hip hop chill',
  raining: 'lo-fi hip hop chill',
  rainy: 'lo-fi hip hop chill',
  storm: 'dark alternative rock intense',
  thunder: 'dark alternative rock intense',
  midnight: 'ambient electronic late night',
  insomnia: 'ambient electronic late night',
  sleepless: 'ambient electronic late night',
  awake: 'ambient electronic late night',
  late: 'ambient electronic late night',
  evening: 'jazz soul slow romantic',
  sunset: 'jazz soul slow romantic',
  dinner: 'jazz soul slow romantic',
  date: 'jazz soul slow romantic',
  homework: 'lo-fi hip hop instrumental study',
  exam: 'lo-fi hip hop instrumental study',
  test: 'lo-fi hip hop instrumental study',
  coding: 'ambient electronic instrumental focus',
  programming: 'ambient electronic instrumental focus',
  writing: 'ambient electronic instrumental focus',
  reading: 'acoustic ambient gentle',
  meditating: 'acoustic ambient gentle',
  yoga: 'acoustic ambient gentle',
  stretching: 'acoustic ambient gentle',
  running: 'electronic dance edm pump',
  jogging: 'electronic dance edm pump',
  cycling: 'hip hop trap high energy',
  lifting: 'hip hop trap workout',
  training: 'hip hop trap workout',
  gaming: 'electronic dance edm uplifting',
  cleaning: 'pop upbeat feel good dance',
  cooking: 'jazz soul slow romantic',
  shopping: 'pop bright upbeat summer',
  walking: 'indie pop mellow warm',
  hiking: 'rock classic road trip',
  camping: 'acoustic folk warm',
  // Spiritual and philosophical
  spiritual: 'acoustic ambient gentle',
  mindful: 'acoustic ambient gentle',
  present: 'acoustic ambient gentle',
  reflective: 'indie folk piano slow',
  contemplative: 'ambient atmospheric slow',
  philosophical: 'ambient atmospheric slow',
  existential: 'ambient atmospheric slow',
  questioning: 'indie alternative midtempo',
  searching: 'ambient atmospheric slow',
  seeking: 'ambient atmospheric slow',
};

const FILLER_WORDS = new Set([
  'songs', 'music', 'play me', 'play', 'i want', 'i need', "i'm looking for", 'looking for',
  'something', 'for my', 'give me', 'me', 'a', 'the', 'to', 'my', 'feeling', 'feel', 'like',
  'want', 'need', 'right now', 'please', 'vibes', 'vibe', 'tracks', 'track', 'listen', 'listening',
  'put on', 'put', 'on', 'some', 'get', 'gimme', 'that', 'is', 'am', 'are', 'be', 'been',
  "i'm", 'im', 'ive', "i've", 'feeling like', 'kind of', 'kinda', 'a bit', 'a little',
  'pretty', 'quite', 'extremely', 'totally', 'absolutely', 'super', 'so so',
  'getting', 'having', 'going through', 'dealing with', 'struggling with', 'suffering from', 'experiencing',
]);

export function translateQuery(rawInput: string): string {
  const normalized = rawInput.trim().toLowerCase();
  if (!normalized) return 'chill';

  const sortedKeys = Object.keys(SCENARIO_TO_QUERY).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (normalized.includes(key)) return SCENARIO_TO_QUERY[key];
  }

  const words = normalized.split(/\s+/).filter((w) => !FILLER_WORDS.has(w) && w.length > 1);
  const cleaned = words.join(' ').trim();
  const fallback = cleaned || normalized || 'chill';
  const lf = fallback.toLowerCase();
  if (lf.includes('calm')) return 'tense uncertain';
  if (lf.includes('relax')) return 'tense uncertain';
  if (lf.includes('peace')) return 'gentle ambient';
  return fallback;
}

function getShiftedQuery(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('stress') || q.includes('overwhelm') || q.includes('anxious') || q.includes('anxiety') || q.includes('nervous'))
    return 'calm peaceful relieving';
  if (q.includes('sad') || q.includes('heartbreak') || q.includes('depress') || q.includes('grief') || q.includes('hopeless'))
    return 'uplifting feel good happy';
  if (q.includes('lonely') || q.includes('empty') || q.includes('lost'))
    return 'warm uplifting comforting';
  if (q.includes('angry') || q.includes('frustrat'))
    return 'calm soothing peaceful';
  if (q.includes('tired') || q.includes('exhaust') || q.includes('bored'))
    return 'energetic upbeat motivating';
  if (q.includes('happy') || q.includes('excit') || q.includes('euphoric') || q.includes('joyful'))
    return 'calm indie acoustic mellow';
  if (q.includes('energetic') || q.includes('workout') || q.includes('gym') || q.includes('pump'))
    return 'chill lofi relaxing';
  if (q.includes('motivat') || q.includes('confident') || q.includes('proud'))
    return 'mellow calm reflective';
  if (q.includes('party') || q.includes('danc'))
    return 'chill acoustic down tempo';
  if (q.includes('focus') || q.includes('study') || q.includes('work'))
    return 'ambient relaxing break';
  if (q.includes('romantic') || q.includes('love'))
    return 'upbeat indie feel good';
  if (q.includes('nostalgic') || q.includes('retro'))
    return 'modern indie alternative fresh';
  if (q.includes('driv') || q.includes('night'))
    return 'calm ambient late night';
  if (q.includes('morning'))
    return 'energetic upbeat fresh start';
  if (q.includes('chill') || q.includes('relax') || q.includes('peaceful'))
    return 'upbeat feel good pop';
  return 'discover new music ' + translateQuery(query);
}

async function searchPlaylists(query: string): Promise<DeezerPlaylistHit[]> {
  try {
    const res = await fetch(`${DEEZER_API_BASE}/search/playlist?q=${encodeURIComponent(query)}&limit=10`);
    if (!res.ok) {
      throw new DeezerNetworkError(`Playlist search failed (${res.status})`);
    }
    const data = await res.json() as { data?: DeezerPlaylistHit[] };
    return data.data || [];
  } catch (err) {
    if (err instanceof DeezerNetworkError) throw err;
    throw new DeezerNetworkError(
      err instanceof Error ? err.message : "Network error while searching playlists"
    );
  }
}

async function fetchPlaylistTracks(playlistId: string | number): Promise<DeezerTrackPayload[]> {
  try {
    const res = await fetch(`${DEEZER_API_BASE}/playlist/${playlistId}/tracks?limit=50`);
    if (!res.ok) {
      throw new DeezerNetworkError(`Playlist tracks failed (${res.status})`);
    }
    const data = await res.json() as { data?: DeezerTrackPayload[] };
    return data.data || [];
  } catch (err) {
    if (err instanceof DeezerNetworkError) throw err;
    throw new DeezerNetworkError(
      err instanceof Error ? err.message : "Network error while fetching playlist tracks"
    );
  }
}

async function fetchTracksByMoodQuery(query: string): Promise<DeezerTrackPayload[]> {
  const playlists = await searchPlaylists(query);
  if (!playlists.length) return [];

  const editorialKeywords = ['deezer', 'filtr', 'digster', 'topsify', 'editor', 'official'];
  const editorial = playlists.filter((p) =>
    editorialKeywords.some((kw) =>
      p.user?.name?.toLowerCase().includes(kw) ||
      p.title?.toLowerCase().includes('official') ||
      p.title?.toLowerCase().includes('top ')
    )
  );

  const fallback = playlists
    .filter((p) => (p.nb_tracks ?? 0) > 20)
    .sort((a, b) => (b.nb_tracks ?? 0) - (a.nb_tracks ?? 0));
  const candidates = editorial.length > 0 ? editorial : fallback;
  // Cap at 2 playlists to keep total HTTP fan-out reasonable (~8 calls/search)
  const top = candidates.slice(0, 2);
  if (!top.length) return [];

  const results = await Promise.allSettled(top.map((p) => fetchPlaylistTracks(p.id)));
  const tracks: DeezerTrackPayload[] = [];
  let networkFailures = 0;
  for (const r of results) {
    if (r.status === "fulfilled") tracks.push(...r.value);
    else networkFailures += 1;
  }
  // If every playlist track fetch failed, surface the network error
  if (networkFailures === results.length && results.length > 0) {
    throw new DeezerNetworkError("Could not load playlist tracks from Deezer");
  }
  return tracks;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function mapDeezerItemToTrack(item: DeezerTrackPayload): Track {
  const t = item.track ?? item;
  return {
    id: Number(t.id),
    title: t.title || 'Unknown Title',
    title_short: t.title_short || t.title || 'Unknown',
    artist: {
      id: Number(t.artist?.id || 0),
      name: t.artist?.name || 'Unknown Artist',
      picture_small: t.artist?.picture_small,
      picture_medium: t.artist?.picture_medium,
    },
    album: {
      id: Number(t.album?.id || 0),
      title: t.album?.title || 'Unknown Album',
      cover_small: t.album?.cover_small,
      cover_medium: t.album?.cover_medium,
      cover_big: t.album?.cover_big,
    },
    duration: t.duration || 0,
    preview: t.preview || '',
    link: t.link || '',
    explicit_lyrics: Boolean(t.explicit_lyrics),
  };
}

// Iterates items in order, keeping unique tracks (by id, max 2 per artist,
// preview required) up to the limit. Order is preserved so callers control the
// blend by ordering the input pool themselves.
function collectUniqueTracks(items: DeezerTrackPayload[], limit: number): Track[] {
  const seenIds = new Set<number>();
  const artistCounts = new Map<string, number>();
  const out: Track[] = [];

  for (const item of items) {
    if (out.length >= limit) break;
    const t = item.track ?? item;
    const id = Number(t.id);
    if (seenIds.has(id)) continue;
    if (!t.preview || t.preview.trim() === '') continue;
    const artistKey = (t.artist?.name || 'Unknown Artist').toLowerCase();
    const count = artistCounts.get(artistKey) ?? 0;
    if (count >= 2) continue;
    seenIds.add(id);
    artistCounts.set(artistKey, count + 1);
    out.push(mapDeezerItemToTrack(item));
  }

  return out;
}

// Alternates two arrays so both sources are represented in the blended result.
function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
}

// Human-readable mood word used to find Deezer's own curated mood playlists
// when shifting away from a mood.
const SHIFT_MOOD_WORD: Record<MoodType, string> = {
  Heartbroken: 'happy feel good',
  Anxious: 'calm relax',
  Happy: 'chill acoustic',
  Energetic: 'chill lofi',
  Focused: 'epic rock',
  Nostalgic: 'modern pop',
  Angry: 'calm meditation',
  Peaceful: 'upbeat dance',
};

export async function getMoodSongs(
  mood: MoodType,
  mode: ModeType,
  rawText?: string,
  analyzed?: { query?: string; label?: string }
): Promise<{ tracks: Track[]; queryUsed: string }> {
  const theme = MOOD_THEMES[mood];
  if (!theme) throw new Error(`Unsupported mood type: ${mood}`);

  const inputText = rawText && rawText.trim().length > 3 ? rawText : mood;
  const queryUsed =
    mode === 'feel'
      ? analyzed?.query || translateQuery(inputText)
      : getShiftedQuery(analyzed?.label || inputText);

  // Pool A: descriptor / keyword-driven search (2 variants to limit fan-out)
  const variants = [
    queryUsed,
    queryUsed.split(' ').slice(0, 2).join(' ') || queryUsed,
  ];
  const descriptorResults = await Promise.allSettled(variants.map(fetchTracksByMoodQuery));

  // Pool B: Deezer's own curated mood playlists, searched by a human mood word.
  const curatedTerm =
    mode === 'feel' ? analyzed?.label || mood : SHIFT_MOOD_WORD[mood];
  const curatedResult = await Promise.allSettled([fetchTracksByMoodQuery(curatedTerm)]);

  const allSettled = [...descriptorResults, ...curatedResult];
  const fulfilled = allSettled.filter((r): r is PromiseFulfilledResult<DeezerTrackPayload[]> => r.status === "fulfilled");
  const rejected = allSettled.filter((r) => r.status === "rejected");

  // If every request failed with a network error, surface that (not "no tracks")
  if (fulfilled.length === 0 && rejected.length > 0) {
    const first = rejected[0] as PromiseRejectedResult;
    const reason = first.reason;
    if (reason instanceof DeezerNetworkError) throw reason;
    throw new DeezerNetworkError(
      reason instanceof Error ? reason.message : "Could not reach Deezer"
    );
  }

  const descriptorArrays = descriptorResults
    .filter((r): r is PromiseFulfilledResult<DeezerTrackPayload[]> => r.status === "fulfilled")
    .map((r) => r.value);
  const curatedItems =
    curatedResult[0]?.status === "fulfilled" ? curatedResult[0].value : [];

  // Blend both pools (each shuffled) so keyword precision and human curation mix.
  const blended = interleave(
    shuffleArray(curatedItems),
    shuffleArray(descriptorArrays.flat())
  );
  const tracks = collectUniqueTracks(blended, 15);

  if (!tracks.length) throw new Error('No tracks found for that vibe. Try different keywords!');

  return { tracks, queryUsed };
}
