import { MoodType } from "../types";
import { detectEmotion } from "../utils/themes";
import { translateQuery } from "./deezer";

/**
 * On-device emotion detection using transformers.js (roberta-base fine-tuned on
 * the go_emotions dataset). Runs entirely in the browser, no API key or backend.
 * Everything degrades gracefully to the keyword engine (detectEmotion +
 * translateQuery) when the model isn't ready, fails, or the connection can't
 * afford the ~126 MB one-time download.
 */

const MODEL_ID = "Xenova/roberta-base-go_emotions";

// If the model init doesn't resolve within this window, we stop showing the
// "loading" state so the UI never implies it's still coming when it's stalled.
const INIT_TIMEOUT_MS = 30_000;

// When the top prediction is "neutral", we still use the strongest real emotion
// if it clears this confidence bar before dropping to the keyword fallback.
const NEUTRAL_FALLBACK_THRESHOLD = 0.3;

export type EmotionSource = "ml" | "keyword";

export interface AnalyzeResult {
  mood: MoodType;
  label: string;
  query: string;
  source: EmotionSource;
}

type ModelStatus = "idle" | "loading" | "ready" | "failed";

// Maps the 28 go_emotions labels onto Deezire's 8 mood buckets (for theme + UI).
const GO_EMOTIONS_TO_MOOD: Record<string, MoodType> = {
  admiration: "Happy",
  amusement: "Happy",
  anger: "Angry",
  annoyance: "Angry",
  approval: "Happy",
  caring: "Peaceful",
  confusion: "Anxious",
  curiosity: "Focused",
  desire: "Happy",
  disappointment: "Heartbroken",
  disapproval: "Angry",
  disgust: "Angry",
  embarrassment: "Anxious",
  excitement: "Energetic",
  fear: "Anxious",
  gratitude: "Happy",
  grief: "Heartbroken",
  joy: "Happy",
  love: "Happy",
  nervousness: "Anxious",
  optimism: "Happy",
  pride: "Happy",
  realization: "Focused",
  relief: "Peaceful",
  remorse: "Heartbroken",
  sadness: "Heartbroken",
  surprise: "Happy",
  neutral: "Peaceful",
};

// Maps each go_emotions label to a Deezer descriptor query (the "feel it" search).
const GO_EMOTIONS_TO_QUERY: Record<string, string> = {
  admiration: "pop upbeat feel good dance",
  amusement: "pop bright upbeat summer",
  anger: "hard rock metal aggressive",
  annoyance: "alternative rock grunge",
  approval: "indie pop mellow warm",
  caring: "acoustic folk warm",
  confusion: "ambient atmospheric slow",
  curiosity: "indie alternative midtempo",
  desire: "jazz soul slow romantic",
  disappointment: "indie folk piano slow",
  disapproval: "alternative rock grunge",
  disgust: "hard rock metal aggressive",
  embarrassment: "dark indie atmospheric tense",
  excitement: "dance electronic upbeat energetic",
  fear: "dark indie atmospheric tense",
  gratitude: "acoustic folk warm",
  grief: "classical piano slow orchestral",
  joy: "pop upbeat feel good dance",
  love: "jazz soul slow romantic",
  nervousness: "dark indie atmospheric tense",
  optimism: "pop upbeat feel good dance",
  pride: "pop rock anthemic triumphant",
  realization: "ambient atmospheric slow",
  relief: "acoustic ambient gentle",
  remorse: "acoustic ballad piano emotional",
  sadness: "indie folk piano slow",
  surprise: "pop bright upbeat summer",
  neutral: "indie pop mellow warm",
};

let classifier: ((text: string, opts?: any) => Promise<any>) | null = null;
let modelPromise: Promise<unknown> | null = null;
let status: ModelStatus = "idle";

// Cache of prior analyses keyed by normalized text (LRU, max 50).
const RESULT_CACHE_MAX = 50;
const resultCache = new Map<string, AnalyzeResult>();

function cacheSet(key: string, value: AnalyzeResult) {
  if (resultCache.has(key)) resultCache.delete(key);
  resultCache.set(key, value);
  if (resultCache.size > RESULT_CACHE_MAX) {
    const oldest = resultCache.keys().next().value;
    if (oldest !== undefined) resultCache.delete(oldest);
  }
}

/**
 * Returns false on data-saver or slow (2g/3g) connections so we can defer the
 * heavy model download; true otherwise or when the API is unavailable.
 */
export function connectionAllowsPreload(): boolean {
  const conn = (navigator as any)?.connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  const slow = ["slow-2g", "2g", "3g"];
  if (conn.effectiveType && slow.includes(conn.effectiveType)) return false;
  return true;
}

export function isModelReady(): boolean {
  return classifier !== null;
}

export function isModelLoading(): boolean {
  return status === "loading";
}

export function getModelStatus(): ModelStatus {
  return status;
}

async function loadPipeline(): Promise<void> {
  const { pipeline, env } = await import("@huggingface/transformers");
  // Browser: only load from the HF hub (weights are cached via the Cache API).
  env.allowLocalModels = false;
  const pipe = await pipeline("text-classification", MODEL_ID, { dtype: "q8" });
  classifier = pipe as unknown as (text: string, opts?: any) => Promise<any>;
  status = "ready";
}

/**
 * Kicks off (or returns the in-flight) model download. Single-flight and safe
 * to call multiple times. Never throws to callers that don't await it.
 */
export function preloadEmotionModel(): Promise<unknown> {
  if (modelPromise) return modelPromise;

  status = "loading";

  const load = loadPipeline().catch((err) => {
    console.warn("Emotion model failed to load; using keyword fallback.", err);
    status = "failed";
    modelPromise = null; // allow a later retry (resumes from cache if partial)
  });

  modelPromise = load;

  // Perceived-status timeout: if it's still loading after the window, stop
  // advertising "loading". If the real load later resolves, classify() still works.
  setTimeout(() => {
    if (status === "loading") status = "failed";
  }, INIT_TIMEOUT_MS);

  return load;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function fromKeywords(text: string): AnalyzeResult {
  const { mood, label } = detectEmotion(text);
  return {
    mood,
    label: label ?? mood,
    query: translateQuery(text),
    source: "keyword",
  };
}

function fromLabel(label: string, text: string): AnalyzeResult {
  const mood = GO_EMOTIONS_TO_MOOD[label];
  if (!mood) return fromKeywords(text);
  return {
    mood,
    label: capitalize(label),
    query: GO_EMOTIONS_TO_QUERY[label] ?? translateQuery(text),
    source: "ml",
  };
}

function fromMlScores(
  scores: { label: string; score: number }[],
  text: string
): AnalyzeResult {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  if (!top) return fromKeywords(text);

  // Neutral handling: prefer the strongest real emotion when it clears the bar.
  if (top.label === "neutral") {
    const nonNeutral = sorted.find(
      (s) => s.label !== "neutral" && s.score >= NEUTRAL_FALLBACK_THRESHOLD
    );
    return nonNeutral ? fromLabel(nonNeutral.label, text) : fromKeywords(text);
  }

  return fromLabel(top.label, text);
}

/**
 * Analyzes free-text mood. Uses the ML model when ready, otherwise the keyword
 * engine. Results are cached by normalized text.
 */
export async function analyzeEmotion(text: string): Promise<AnalyzeResult> {
  const key = text.trim().toLowerCase();
  const cached = resultCache.get(key);
  if (cached) return cached;

  let result: AnalyzeResult;

  if (classifier) {
    try {
      const raw = await classifier(text, { top_k: 5 });
      const scores = (Array.isArray(raw) ? raw : [raw]) as {
        label: string;
        score: number;
      }[];
      result = fromMlScores(scores, text);
    } catch (err) {
      console.warn("Emotion classification failed; using keyword fallback.", err);
      result = fromKeywords(text);
    }
  } else {
    result = fromKeywords(text);
  }

  if (result.source === "ml") {
    cacheSet(key, result);
  }
  return result;
}
