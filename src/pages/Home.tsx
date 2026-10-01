import {
  CSSProperties,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Headphones,
  Loader2,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  Search,
  Waves,
  X,
  WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { useConfirm } from "../context/ConfirmContext";
import { getMoodSongs, DeezerNetworkError } from "../services/deezer";
import {
  analyzeEmotion,
  preloadEmotionModel,
  connectionAllowsPreload,
  isModelReady,
} from "../services/emotionClassifier";
import { MOODS, MOOD_PRESENTATION } from "../config/moodPresentation";
import { MoodType, ModeType } from "../types";
import { MoodArtwork } from "../components/MoodArtwork";
import { MoodMark } from "../components/MoodMark";
import { TrackList } from "../components/TrackList";
import { AlbumArt } from "../components/AlbumArt";
import { CustomLogo } from "../components/CustomLogo";

type HomeView = "input" | "choosing" | "loading" | "error" | "results";
const enter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.23 },
};

export function Home() {
  const {
    searchResult,
    setSearchResult,
    lastQuery,
    setLastQuery,
    activeTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    isCooldownActive,
    setSearchCooldown,
    cooldownUntil,
    setQueue,
    triggerToast,
  } = useApp();
  const confirm = useConfirm();
  const initial = searchResult || lastQuery;
  const [localStep, setLocalStep] = useState<HomeView>(
    searchResult ? "results" : lastQuery ? "choosing" : "input",
  );
  const [rawText, setRawText] = useState(initial?.rawText || "");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(
    initial?.mood || null,
  );
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(
    initial?.emotionLabel || null,
  );
  const [chosenMode, setChosenMode] = useState<ModeType | null>(
    initial?.mode || null,
  );
  const [analyzedQuery, setAnalyzedQuery] = useState<string | null>(
    initial?.analyzedQuery || null,
  );
  const [analyzedLabel, setAnalyzedLabel] = useState<string | null>(
    initial?.analyzedLabel || null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [loadingSlowly, setLoadingSlowly] = useState(false);
  const [inputError, setInputError] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isSearchingRef = useRef(false);
  const searchGenerationRef = useRef(0);
  const analysisGenerationRef = useRef(0);
  const mountedRef = useRef(true);
  const previousStepRef = useRef(localStep);
  const activeMood = localStep === "input" ? null : selectedMood;
  const presentation = activeMood ? MOOD_PRESENTATION[activeMood] : null;
  const isCoolingDown = cooldownRemaining > 0;
  const countdown = Math.ceil(cooldownRemaining / 1000);

  useEffect(() => {
    mountedRef.current = true;
    const searches = searchGenerationRef;
    const analyses = analysisGenerationRef;
    return () => {
      mountedRef.current = false;
      ++searches.current;
      ++analyses.current;
    };
  }, []);
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, cooldownUntil - Date.now());
      setCooldownRemaining(remaining);
      return remaining;
    };
    if (tick() <= 0) return;
    const timer = setInterval(() => {
      if (tick() <= 0) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [cooldownUntil]);
  useEffect(() => {
    if (searchResult || lastQuery) return;
    ++searchGenerationRef.current;
    ++analysisGenerationRef.current;
    isSearchingRef.current = false;
    setIsRefreshing(false);
    setAnalyzing(false);
    setLocalStep("input");
    setRawText("");
    setSelectedMood(null);
    setDetectedEmotion(null);
    setChosenMode(null);
    setAnalyzedQuery(null);
    setAnalyzedLabel(null);
    setErrorMessage("");
    setRefreshError(null);
    setInputError("");
  }, [searchResult, lastQuery]);
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--mood-color",
      presentation?.color || "#c699ff",
    );
    document.documentElement.style.setProperty(
      "--mood-soft",
      presentation?.soft || "#30124a",
    );
    return () => {
      document.documentElement.style.removeProperty("--mood-color");
      document.documentElement.style.removeProperty("--mood-soft");
    };
  }, [presentation]);
  useEffect(() => {
    if (previousStepRef.current !== localStep) {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
      previousStepRef.current = localStep;
    }
    if (localStep !== "loading") {
      setLoadingSlowly(false);
      return;
    }
    const timer = setTimeout(() => setLoadingSlowly(true), 6500);
    return () => clearTimeout(timer);
  }, [localStep]);

  const handleInputSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setInputError("Tell us a little about your mood, or pick one below.");
      textareaRef.current?.focus();
      return;
    }
    if (analyzing) return;
    setInputError("");
    setAnalyzing(true);
    const generation = ++analysisGenerationRef.current;
    // User-initiated only. Mood chips never download the model; respect Save-Data.
    if (!isModelReady() && connectionAllowsPreload()) {
      setModelLoading(true);
      void preloadEmotionModel()
        .catch(() => {})
        .finally(() => {
          if (mountedRef.current) setModelLoading(false);
        });
    }
    try {
      const analysis = await analyzeEmotion(trimmed);
      if (generation !== analysisGenerationRef.current || !mountedRef.current)
        return;
      setSelectedMood(analysis.mood);
      setDetectedEmotion(analysis.label);
      setAnalyzedQuery(analysis.query);
      setAnalyzedLabel(analysis.label);
      setRawText(trimmed);
      setLastQuery({
        rawText: trimmed,
        mood: analysis.mood,
        mode: chosenMode || "feel",
        emotionLabel: analysis.label,
        analyzedQuery: analysis.query,
        analyzedLabel: analysis.label,
      });
      setLocalStep("choosing");
    } catch {
      setInputError(
        "We could not read that mood. Try again or choose a mood below.",
      );
    } finally {
      if (mountedRef.current && generation === analysisGenerationRef.current)
        setAnalyzing(false);
    }
  };
  const handleChipClick = (mood: MoodType) => {
    ++analysisGenerationRef.current;
    setAnalyzing(false);
    setRawText("");
    setSelectedMood(mood);
    setDetectedEmotion(mood);
    setAnalyzedQuery(null);
    setAnalyzedLabel(null);
    setLastQuery({
      rawText: "",
      mood,
      mode: chosenMode || "feel",
      emotionLabel: mood,
    });
    setLocalStep("choosing");
  };
  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void handleInputSubmit(rawText);
    }
  };
  const changeMood = () => {
    ++searchGenerationRef.current;
    ++analysisGenerationRef.current;
    isSearchingRef.current = false;
    setIsRefreshing(false);
    setAnalyzing(false);
    setLocalStep("input");
  };

  const runSearch = async (mode: ModeType, mood: MoodType, refresh = false) => {
    if (isCooldownActive() || isSearchingRef.current) return;
    const generation = ++searchGenerationRef.current;
    isSearchingRef.current = true;
    setChosenMode(mode);
    setErrorMessage("");
    setRefreshError(null);
    setSearchCooldown(5);
    if (refresh) setIsRefreshing(true);
    else setLocalStep("loading");
    const analyzed =
      analyzedQuery || analyzedLabel
        ? {
            query: analyzedQuery ?? undefined,
            label: analyzedLabel ?? undefined,
          }
        : undefined;
    try {
      const response = await getMoodSongs(mood, mode, rawText, analyzed);
      if (generation !== searchGenerationRef.current || !mountedRef.current)
        return;
      setSearchResult({
        tracks: response.tracks,
        mood,
        mode,
        rawText,
        queryUsed: response.queryUsed,
        timestamp: Date.now(),
        emotionLabel: detectedEmotion ?? undefined,
        analyzedQuery: analyzedQuery ?? undefined,
        analyzedLabel: analyzedLabel ?? undefined,
      });
      setQueue(response.tracks);
      setLastQuery({
        rawText,
        mood,
        mode,
        emotionLabel: detectedEmotion ?? undefined,
        analyzedQuery: analyzedQuery ?? undefined,
        analyzedLabel: analyzedLabel ?? undefined,
      });
      setLocalStep("results");
      if (refresh) triggerToast("A fresh mix, for the same feeling.");
    } catch (error) {
      if (generation !== searchGenerationRef.current || !mountedRef.current)
        return;
      const message =
        error instanceof DeezerNetworkError
          ? "We could not connect to Deezer. Check your connection, then try again."
          : "We could not find a playable mix this time. Try again or choose another mood.";
      if (refresh) {
        setRefreshError(message);
        triggerToast("Your mix is still here. We could not load more songs.");
        setLocalStep("results");
      } else {
        setErrorMessage(message);
        setLocalStep("error");
      }
    } finally {
      if (generation === searchGenerationRef.current) {
        isSearchingRef.current = false;
        setIsRefreshing(false);
      }
    }
  };
  const handleFindMore = async () => {
    if (!selectedMood || !chosenMode || isCoolingDown || isRefreshing) return;
    if (
      await confirm({
        title: "Ready for a fresh mix?",
        description:
          "This replaces the songs in your current mix. Your liked songs stay saved.",
        confirmLabel: "Find more songs",
        cancelLabel: "Keep this mix",
      })
    ) {
      if (mountedRef.current) void runSearch(chosenMode, selectedMood, true);
    }
  };
  const step = localStep === "input" ? 0 : localStep === "choosing" ? 1 : 2;
  const tracks = searchResult?.tracks || [];
  const mixIsPlaying =
    isPlaying && tracks.some((t) => t.id === activeTrack?.id);

  return (
    <div className={`home-page page-shell view-${localStep}`}>
      {localStep !== "input" && (
        <div className="flow-top">
          <button className="text-button" onClick={changeMood}>
            <ArrowLeft size={16} />
            Change mood
          </button>
          <ol className="stepper" aria-label="Discover progress">
            {["Your mood", "Your direction", "Your mix"].map((label, i) => (
              <li
                key={label}
                aria-current={step === i ? "step" : undefined}
                className={step >= i ? "step-active" : ""}
              >
                <span>{step > i ? <Check size={12} /> : i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        </div>
      )}
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() =>
          requestAnimationFrame(() =>
            headingRef.current?.focus({ preventScroll: true }),
          )
        }
      >
        {localStep === "input" && (
          <motion.section key="input" {...enter}>
            <div className="discovery-layout">
              <div className="discovery-content">
                <div className="eyebrow">
                  <span className="status-dot" />
                  YOUR MOOD. YOUR MOMENT.
                </div>
                <h1 ref={headingRef} tabIndex={-1}>
                  Every feeling
                  <br />
                  has a <span className="gradient-text">soundtrack.</span>
                </h1>
                <p className="lead">
                  However you’re feeling, there’s music for that.
                  <br className="desktop-only" /> Let’s find yours.
                </p>
                <form
                  className="mood-form"
                  onSubmit={(event: FormEvent) => {
                    event.preventDefault();
                    void handleInputSubmit(rawText);
                  }}
                >
                  <label htmlFor="mood-input">
                    <MessageCircle size={17} />
                    What’s on your mind?
                  </label>
                  <textarea
                    ref={textareaRef}
                    id="mood-input"
                    maxLength={500}
                    value={rawText}
                    onChange={(e) => {
                      setRawText(e.target.value);
                      setInputError("");
                    }}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="It’s been one of those days…"
                    rows={3}
                    aria-invalid={!!inputError}
                    aria-describedby={
                      inputError ? "mood-input-error" : "mood-input-help"
                    }
                  />
                  {inputError && (
                    <p
                      id="mood-input-error"
                      className="field-error"
                      role="alert"
                    >
                      {inputError}
                    </p>
                  )}
                  <div className="mood-form-footer">
                    <span id="mood-input-help">
                      Enter to continue <span aria-hidden="true">↵</span>
                      <small>Shift + Enter for a new line</small>
                    </span>
                    <button
                      className="button primary"
                      type="submit"
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="spin" size={18} />
                          Reading your mood…
                        </>
                      ) : (
                        <>
                          Find my soundtrack
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
                <div className="mood-picker">
                  <div className="section-caption">
                    <span>Or start with a feeling</span>
                    <span>8 moods. Endless discoveries.</span>
                  </div>
                  <div className="mood-chips">
                    {MOODS.map((mood) => (
                      <button
                        key={mood}
                        className="mood-chip"
                        style={
                          {
                            "--chip-color": MOOD_PRESENTATION[mood].color,
                          } as CSSProperties
                        }
                        onClick={() => handleChipClick(mood)}
                      >
                        <MoodMark mood={mood} />
                        {mood}
                        <ArrowUpRight size={13} />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="quiet-note">
                  <Headphones size={14} />
                  30-second previews. No account needed.
                </p>
                {searchResult && (
                  <button
                    className="text-button return-mix"
                    onClick={() => {
                      setSelectedMood(searchResult.mood);
                      setChosenMode(searchResult.mode);
                      setRawText(searchResult.rawText);
                      setDetectedEmotion(searchResult.emotionLabel || null);
                      setAnalyzedQuery(searchResult.analyzedQuery || null);
                      setAnalyzedLabel(searchResult.analyzedLabel || null);
                      setLocalStep("results");
                    }}
                  >
                    Back to your current mix
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
              <aside className="discovery-aside">
                <div className="artwork-topline">
                  <span>THE SOUND OF BEING YOU</span>
                  <span>VOL. 01</span>
                </div>
                <MoodArtwork />
                <div className="artwork-footer">
                  <div>
                    <span className="eyebrow">FEEL IT / SHIFT IT</span>
                    <p>
                      Meet your mood.
                      <br />
                      Or take it somewhere new.
                    </p>
                  </div>
                  <Waves size={36} strokeWidth={1} />
                </div>
              </aside>
            </div>
            <div className="how-strip">
              {[
                {
                  number: "01",
                  title: "Bring your feeling",
                  text: "A few words. A whole mood.",
                },
                {
                  number: "02",
                  title: "Choose your direction",
                  text: "Lean in, or change the energy.",
                },
                {
                  number: "03",
                  title: "Find your next favorite",
                  text: "Listen, like, and make it yours.",
                },
              ].map((item) => (
                <div key={item.number}>
                  <span>{item.number}</span>
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {localStep === "choosing" && selectedMood && (
          <motion.section key="choosing" {...enter} className="choosing-screen">
            <p className="eyebrow mood-status" aria-live="polite">
              <MoodMark mood={selectedMood} />
              {rawText
                ? `WE PICKED UP ${detectedEmotion || selectedMood}`
                : `${selectedMood.toUpperCase()} — ${MOOD_PRESENTATION[selectedMood].caption}`}
            </p>
            <h1 ref={headingRef} tabIndex={-1}>
              Where do we go
              <br />
              from{" "}
              <span className="mood-text">{selectedMood.toLowerCase()}?</span>
            </h1>
            <p className="lead">
              Stay with the feeling, or find a new frequency.
              <br />
              You set the direction.
            </p>
            <div className="direction-cards">
              {(["feel", "shift"] as ModeType[]).map((mode) => (
                <button
                  key={mode}
                  className={`direction-card direction-${mode}`}
                  disabled={isCoolingDown}
                  onClick={() => void runSearch(mode, selectedMood)}
                >
                  <div className="direction-top">
                    <span className="eyebrow">
                      {mode === "feel" ? "MEET YOUR MOOD" : "CHANGE THE ENERGY"}
                    </span>
                    <ArrowUpRight size={25} />
                  </div>
                  <div
                    className={`direction-visual ${mode}`}
                    aria-hidden="true"
                  >
                    {mode === "feel" ? (
                      <>
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </>
                    ) : (
                      <>
                        <ArrowUpRight />
                        <ArrowUpRight />
                        <ArrowUpRight />
                      </>
                    )}
                  </div>
                  <h2>{mode === "feel" ? "Feel it." : "Shift it."}</h2>
                  <p>{MOOD_PRESENTATION[selectedMood][mode]}</p>
                  <span className="direction-action">
                    {mode === "feel"
                      ? "Find songs that get it"
                      : "Take me somewhere new"}
                    <ArrowRight size={18} />
                  </span>
                </button>
              ))}
            </div>
            <div className="choice-footnote" role="status">
              {isCoolingDown
                ? `Your next mix is ready to request in ${countdown}s.`
                : modelLoading
                  ? "Fine-tuning mood understanding in the background. You can continue."
                  : "No right choice. Just what feels right for you."}
            </div>
          </motion.section>
        )}

        {localStep === "loading" && (
          <motion.section
            key="loading"
            {...enter}
            className="loading-screen"
            aria-busy="true"
          >
            <div className="loading-record">
              <CustomLogo size={62} animate />
            </div>
            <span className="eyebrow">TUNING IN TO YOU</span>
            <h1 ref={headingRef} tabIndex={-1}>
              Finding your frequency.
            </h1>
            <p role="status" className="lead">
              {loadingSlowly
                ? "Still searching. Deezer is taking a little longer."
                : "Exploring Deezer playlists for your kind of sound."}
            </p>
            <div
              className="loading-progress"
              role="progressbar"
              aria-label="Searching Deezer playlists"
            >
              <span />
            </div>
            <div className="loading-track-stack" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <span />
                  <div>
                    <i />
                    <i />
                  </div>
                  <i />
                </div>
              ))}
            </div>
            <button
              className="text-button"
              onClick={() => {
                ++searchGenerationRef.current;
                isSearchingRef.current = false;
                setLocalStep("choosing");
              }}
            >
              <ArrowLeft size={16} />
              Back to your direction
            </button>
          </motion.section>
        )}

        {localStep === "results" && searchResult && (
          <motion.section key="results" {...enter}>
            <div className="mix-hero">
              <div className={`mix-art ${tracks.length < 4 ? "single" : ""}`}>
                {tracks.length ? (
                  tracks
                    .slice(0, tracks.length >= 4 ? 4 : 1)
                    .map((t) => <AlbumArt key={t.id} track={t} large />)
                ) : (
                  <MoodArtwork compact />
                )}
              </div>
              <div className="mix-copy">
                <span className="eyebrow mood-text">
                  {searchResult.mood.toUpperCase()} /{" "}
                  {searchResult.mode === "feel" ? "FEEL IT" : "SHIFT IT"}
                </span>
                <h1 ref={headingRef} tabIndex={-1}>
                  {searchResult.mode === "feel"
                    ? MOOD_PRESENTATION[searchResult.mood].mix
                    : "A change of pace."}
                </h1>
                <p className="lead">
                  {MOOD_PRESENTATION[searchResult.mood][searchResult.mode]}
                </p>
                <p className="mix-meta">
                  <CustomLogo size={18} />
                  Made for your moment<span>•</span>
                  {tracks.length} tracks<span>•</span>30s previews
                </p>
              </div>
            </div>
            {rawText && (
              <p className="your-words">
                <MessageCircle size={16} />
                <span>Your words: “{rawText}”</span>
              </p>
            )}
            <div className="mix-toolbar">
              <button
                className="button primary"
                disabled={!tracks.some((t) => t.preview?.trim())}
                onClick={() => {
                  if (mixIsPlaying) pauseTrack();
                  else {
                    const first = tracks.find((t) => t.preview?.trim());
                    if (first) {
                      setQueue(tracks);
                      playTrack(first);
                    }
                  }
                }}
              >
                {mixIsPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
                {mixIsPlaying ? "Pause mix" : "Play this mix"}
              </button>
              <button
                className="button secondary"
                disabled={isCoolingDown || isRefreshing}
                onClick={handleFindMore}
              >
                {isRefreshing ? (
                  <Loader2 size={17} className="spin" />
                ) : isCoolingDown ? (
                  <span
                    className="cooldown-ring"
                    style={
                      {
                        "--progress": `${(1 - cooldownRemaining / 5000) * 100}%`,
                      } as CSSProperties
                    }
                  >
                    {countdown}
                  </span>
                ) : (
                  <RefreshCw size={16} />
                )}
                {isRefreshing
                  ? "Finding more…"
                  : isCoolingDown
                    ? `More songs in ${countdown}s`
                    : "Find more songs"}
              </button>
              <span className="toolbar-note">
                <Headphones size={14} />A little preview. A new favorite.
              </span>
            </div>
            {refreshError && (
              <div className="inline-banner error-banner" role="alert">
                <WifiOff size={19} />
                <div>
                  <strong>Your current mix is still here.</strong>
                  <p>{refreshError}</p>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setRefreshError(null)}
                  aria-label="Dismiss refresh error"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {tracks.length ? (
              <div aria-busy={isRefreshing}>
                <TrackList tracks={tracks} />
              </div>
            ) : (
              <div className="empty-state">
                <Search size={36} />
                <h2>No previews in this mix yet.</h2>
                <p>Try “Find more songs” or choose another mood.</p>
              </div>
            )}
            <p className="list-footer">
              Music provided by Deezer. Full tracks open on Deezer.
            </p>
          </motion.section>
        )}

        {localStep === "error" && (
          <motion.section key="error" {...enter} className="error-screen">
            <div className="state-icon">
              <WifiOff size={30} />
            </div>
            <span className="eyebrow">A MOMENT OF STATIC</span>
            <h1 ref={headingRef} tabIndex={-1}>
              Let’s try that again.
            </h1>
            <p className="lead" role="alert">
              {errorMessage}
            </p>
            <div className="state-actions">
              <button
                className="button primary"
                disabled={isCoolingDown}
                onClick={() => {
                  if (selectedMood && chosenMode)
                    void runSearch(chosenMode, selectedMood);
                }}
              >
                <RefreshCw size={17} />
                {isCoolingDown ? `Try again in ${countdown}s` : "Try again"}
              </button>
              <button className="button secondary" onClick={changeMood}>
                Type again
                <ArrowRight size={17} />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Home;
