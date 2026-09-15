import { MoodType, MoodTheme, ModeType } from "../types";

export const MOOD_THEMES: Record<MoodType, MoodTheme> = {
  Heartbroken: {
    mood: "Heartbroken",
    emoji: "💔",
    gradient: "from-[#1a1b35] via-[#101021] to-[#070712]",
    textColor: "text-blue-400",
    feelQuery: "sad heartbreak love songs acoustic sad",
    shiftQuery: "carefree pop upbeat dance feel good gold",
    feelDescription: "Savor the sorrow. Wrap yourself in melancholy melodies that understand exactly how it hurts.",
    shiftDescription: "Time to let go! Empowering, high-energy pop and carefree dance anthems to build you back up."
  },
  Anxious: {
    mood: "Anxious",
    emoji: "😰",
    gradient: "from-[#112430] via-[#0b161e] to-[#04080b]",
    textColor: "text-teal-400",
    feelQuery: "ambient calm breathing peaceful soundscape rain",
    shiftQuery: "lofi hip hop chill study beats groove",
    feelDescription: "Sit with the stillness. Soft ambient soundscapes and quiet tones to help ground your breathing.",
    shiftDescription: "Calm yet groovy. Easy lofi beats and gentle jazz rhythms to soothe a racing mind."
  },
  Happy: {
    mood: "Happy",
    emoji: "😊",
    gradient: "from-[#332211] via-[#1a1108] to-[#080502]",
    textColor: "text-amber-400",
    feelQuery: "feel good sunny daylight happy summer pop hits",
    shiftQuery: "acoustic guitar folk chill mellow acoustic strings",
    feelDescription: "Ride the high! Unstoppable sunshine melodies and radiant hits to amplify your awesome mood.",
    shiftDescription: "Simmer down. Soft acoustic strings and cozy grooves to keep you relaxed and content."
  },
  Energetic: {
    mood: "Energetic",
    emoji: "⚡",
    gradient: "from-[#2b0f42] via-[#150721] to-[#09030e]",
    textColor: "text-fuchsia-400",
    feelQuery: "workout running gym high energy dance house hype",
    shiftQuery: "peaceful classical masterwork soft solo piano",
    feelDescription: "Unleash the spark! Pure adrenaline tracks, electronic drive, and massive beats to power your body.",
    shiftDescription: "Reset your heart rate. Beautiful classical movements and peaceful piano keys to calm down."
  },
  Focused: {
    mood: "Focused",
    emoji: "🎯",
    gradient: "from-[#0a2320] via-[#051210] to-[#020706]",
    textColor: "text-emerald-400",
    feelQuery: "deep focus coding ambient techno synthwave study",
    shiftQuery: "stadium rock high energy epic progressive rock",
    feelDescription: "Deep focus state. Clean, repetitive electronic rhythms and focus waves to clear intellectual dust.",
    shiftDescription: "Break the barrier. Progressive rock anthems and driving tracks to blow away any code writer's block."
  },
  Nostalgic: {
    mood: "Nostalgic",
    emoji: "📻",
    gradient: "from-[#2f1f1a] via-[#18100d] to-[#0a0605]",
    textColor: "text-amber-600",
    feelQuery: "throwback 80s synthpop oldies classic retro 90s",
    shiftQuery: "modern clean pop synthwave futuristic future hits 2026",
    feelDescription: "Step into the time machine. Vintage rhythms and legendary classics that feel like a warm embrace.",
    shiftDescription: "Back to the future. Clean cutting-edge 2026 electropop and driving modern basslines."
  },
  Angry: {
    mood: "Angry",
    emoji: "🤬",
    gradient: "from-[#351012] via-[#1b0809] to-[#0b0304]",
    textColor: "text-rose-500",
    feelQuery: "heavy metalcore hard rock angry phonk trap bass",
    shiftQuery: "zen meditation sound baths spa garden peaceful relaxing",
    feelDescription: "Unleash the roar. High-distortion rock, aggressive trap, and screaming guitars to run your rage through.",
    shiftDescription: "Extinguish the flames. Serene nature streams, bells, and harp acoustics to cool down hot nerves."
  },
  Peaceful: {
    mood: "Peaceful",
    emoji: "🍃",
    gradient: "from-[#0f281e] via-[#08150f] to-[#030806]",
    textColor: "text-emerald-300",
    feelQuery: "acoustic singer songwriter folk acoustic peace zen",
    shiftQuery: "dynamic funk synthpop groove dance upbeat pop",
    feelDescription: "Float in absolute bliss. Acoustic songwriters, gentle drums, and soft vocalists for organic relaxation.",
    shiftDescription: "Inject some motion. Soulful bass lines, bouncy tempos, and lighthearted tracks to make you dance."
  }
};

// Map keywords to respective mood types to scoring raw natural language inputs
const KEYWORD_MAPS: Record<MoodType, string[]> = {
  Heartbroken: [
    "heartbroken", "heartbreak", "heart", "break", "sad", "cry", "broke", "split", 
    "divorce", "down", "hurtful", "lonely", "alone", "crying", "sorrow", "blue", 
    "weep", "weeping", "grief", "breakup", "dumped", "sadness", "empty", "miserable",
    "upset", "unhappy", "gloomy", "melancholy", "melancholic", "heartache", "wounded",
    "crushed", "devastated", "shattered", "torn", "hollow", "void", "hopeless", "helpless",
    "worthless", "ashamed", "guilty", "humiliated", "rejected", "abandoned", "neglected",
    "invisible", "isolated", "alienated", "disconnected", "betrayed", "deceived", "cheated",
    "grieving", "mourning", "bereaved", "sobbing", "depression", "depressed", "despair",
    "desperate", "anguish", "torment", "suffering", "longing", "yearning", "pining",
    "missing", "homesick", "died", "die", "dying", "death", "dead", "passed", "funeral",
    "grave", "buried", "loss", "gone"
  ],
  Anxious: [
    "anxious", "anxiety", "nervous", "panic", "stress", "stressed", "worry", "worried", 
    "fear", "tense", "panic", "restless", "scared", "overwhelmed", "fret", "scary", "jittery",
    "insecure", "embarrassed", "afraid", "frightened", "terrified", "paranoid", "panicking",
    "uneasy", "jealous", "envious", "trapped", "stuck", "confused"
  ],
  Happy: [
    "happy", "content", "joy", "joyful", "celebrate", "sunny", "great", "glad", 
    "smile", "smiling", "cheerful", "excited", "ecstatic", "blessed", "wonderful", "good",
    "hopeful", "optimistic", "thankful", "loved", "cherished", "adored", "relieved",
    "accomplished", "successful", "victorious", "triumphant", "celebrating", "festive",
    "playful", "fun", "carefree", "lighthearted", "inspired", "creative", "curious",
    "adventurous", "free", "liberated", "inlove", "infatuated", "passionate", "tender",
    "affectionate"
  ],
  Energetic: [
    "energetic", "workout", "energy", "pumped", "run", "gym", "heavy", "lift", 
    "hype", "active", "fast", "speed", "power", "vibrant", "adrenaline", "dance", "electronic",
    "alive", "radiant", "thriving", "unstoppable", "invincible", "powerful", "strong",
    "fearless", "brave", "courageous", "determined", "driven", "ambitious", "running",
    "jogging", "cycling", "lifting", "training"
  ],
  Focused: [
    "focus", "study", "work", "coding", "write", "reading", "learn", "concentrate", 
    "concentrating", "tasks", "task", "homework", "grind", "office", "productive",
    "programming", "writing", "exam"
  ],
  Nostalgic: [
    "nostalgic", "nostalgia", "vintage", "cassette", "memories", "old", "retro", 
    "past", "childhood", "throwback", "remember", "reminisce", "classic", "goldies", "vinyl",
    "sentimental", "reminiscing"
  ],
  Angry: [
    "angry", "rage", "hate", "mad", "pissed", "fury", "furious", "scream", "hate", 
    "fight", "annoyed", "irritation", "trigger", "triggered", "shout", "madness",
    "agitated", "irritated", "resentful", "bitter"
  ],
  Peaceful: [
    "peaceful", "calm", "relaxed", "sleep", "quiet", "silent", "zen", "healing", 
    "nature", "meditation", "wind down", "slow", "breathing", "chill", "solitude", "harmony",
    "safe", "secure", "cozy", "comfortable", "serene", "tranquil", "balanced", "centered",
    "grounded", "easygoing", "mellow", "mindful", "reflective", "contemplative", "meditating",
    "yoga", "drained", "burnout", "fatigued", "sleepy", "drowsy", "sluggish", "unmotivated",
    "apathetic", "detached"
  ]
};

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Words that detect grief/sadness but should not be shown literally as the emotion label.
const TRIGGER_ONLY_KEYWORDS = new Set([
  "died", "die", "dying", "death", "dead", "passed", "funeral", "grave", "buried",
  "loss", "gone", "broke",
]);

/**
 * Detects both the closest mood bucket (for theme + song matching) and the specific
 * emotion word the user actually typed (for display). Returns label === null when no
 * keyword matched and the result came from the sentiment fallback.
 */
export function detectEmotion(text: string): { mood: MoodType; label: string | null } {
  const normalized = text.toLowerCase();
  let maxScore = -1;
  let bestMood: MoodType = "Happy";
  let bestMatches: string[] = [];

  for (const [mood, keywords] of Object.entries(KEYWORD_MAPS) as [MoodType, string[]][]) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Check direct matching word presence and frequency
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, "gi");
      const matches = normalized.match(regex);
      if (matches) {
        score += matches.length * 2; // Exact word match weighted nicely
        matchedKeywords.push(kw);
      } else if (normalized.includes(kw)) {
        score += 1; // Substring match
        matchedKeywords.push(kw);
      }
    });

    // Tie-breaker if score matches
    if (score > maxScore) {
      maxScore = score;
      bestMood = mood;
      bestMatches = matchedKeywords;
    }
  }

  // If score is 0, fall back to lightweight sentiment cues before defaulting
  if (maxScore <= 0) {
    if (
      normalized.includes("hurt") || normalized.includes("tears") || normalized.includes("pain") ||
      normalized.includes("sad") || normalized.includes("lonely") || normalized.includes("lost") ||
      normalized.includes("numb") || normalized.includes("depress") || normalized.includes("grief") ||
      normalized.includes("broke") || normalized.includes("died") || normalized.includes("death") ||
      normalized.includes("passed away") || normalized.includes("funeral") || normalized.includes("loss")
    ) return { mood: "Heartbroken", label: null };
    if (
      normalized.includes("worr") || normalized.includes("afraid") || normalized.includes("scare") ||
      normalized.includes("panic") || normalized.includes("stress") || normalized.includes("overwhelm")
    ) return { mood: "Anxious", label: null };
    if (normalized.includes("calm") || normalized.includes("rest") || normalized.includes("quiet")) return { mood: "Peaceful", label: null };
    if (normalized.includes("gym") || normalized.includes("sport") || normalized.includes("fast")) return { mood: "Energetic", label: null };
    return { mood: "Happy", label: null }; // Neutral default when no cues are present
  }

  // Prefer the longest matched keyword in the winning bucket as the most specific label
  const longest = bestMatches.reduce((a, b) => (b.length > a.length ? b : a), "");
  if (!longest) return { mood: bestMood, label: null };
  if (TRIGGER_ONLY_KEYWORDS.has(longest)) {
    return { mood: bestMood, label: bestMood };
  }
  return { mood: bestMood, label: capitalize(longest) };
}

/**
 * Maps an arbitrary mood/emotion string onto the closest MoodType bucket.
 * Used when restoring persisted moods that may not be exact enum values.
 */
export function normalizeMood(mood: string): MoodType {
  const m = mood.toLowerCase();
  if (m.includes("heartbreak") || m.includes("sad") || m.includes("melanchol") || m.includes("depress") || m.includes("lonely") || m.includes("grief")) return "Heartbroken";
  if (m.includes("anxious") || m.includes("anxiety") || m.includes("nervous") || m.includes("stress") || m.includes("overwhelm")) return "Anxious";
  if (m.includes("happy") || m.includes("joy") || m.includes("euphoric") || m.includes("excit") || m.includes("content") || m.includes("grateful") || m.includes("proud")) return "Happy";
  if (m.includes("energetic") || m.includes("workout") || m.includes("gym") || m.includes("motivated") || m.includes("confident")) return "Energetic";
  if (m.includes("focus") || m.includes("study") || m.includes("work")) return "Focused";
  if (m.includes("nostalgic") || m.includes("nostalgia") || m.includes("retro")) return "Nostalgic";
  if (m.includes("angry") || m.includes("frustrat") || m.includes("rage")) return "Angry";
  if (m.includes("chill") || m.includes("relax") || m.includes("peaceful") || m.includes("calm")) return "Peaceful";
  return "Happy";
}

/**
 * Classifies raw natural language input into the closest mood bucket.
 * Thin wrapper around detectEmotion for callers that only need the bucket.
 */
export function classifyMoodFromText(text: string): MoodType {
  return detectEmotion(text).mood;
}

/**
 * Builds the italic mood description. Presets (or no specific word) keep their curated
 * copy; a custom detected emotion gets a word-aware line so it never mismatches the label.
 */
export function getMoodDescription(mood: MoodType, mode: ModeType, label: string | null): string {
  const theme = MOOD_THEMES[mood];
  const curated = mode === "shift" ? theme.shiftDescription : theme.feelDescription;

  if (!label || label.toLowerCase() === mood.toLowerCase()) {
    return curated;
  }

  const labelLower = label.toLowerCase();
  return mode === "shift"
    ? `Music to help shift you out of feeling ${labelLower}.`
    : `Music that leans into feeling ${labelLower} right now.`;
}
