import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import {
  likedSongsKey,
  readAccountLikes,
  readLocalStorage,
} from "../utils/accountStorage";
import { Track, SearchResult, LastQueryState } from "../types";
import {
  parseLastQuery,
  parseSearchResult,
  safeLocalStorageRemove,
  safeLocalStorageSet,
} from "../utils/storageGuards";

interface ToastState {
  message: string;
  visible: boolean;
  track?: Track;
  actionType: "unlike" | "generic";
  key: number; // Unique identifier to force re-render/animations
}

interface AppContextType {
  // Saved songs
  likedSongs: Track[];
  likeTrack: (track: Track) => void;
  unlikeTrack: (trackId: number) => void;
  undoUnlike: () => void;

  // Custom Toasts
  toast: ToastState | null;
  triggerToast: (
    message: string,
    track?: Track,
    actionType?: "unlike" | "generic",
  ) => void;
  clearToast: () => void;

  // Cooldown timer
  cooldownUntil: number;
  setSearchCooldown: (seconds: number) => void;
  isCooldownActive: () => boolean;
  getCooldownRemaining: () => number;

  // Active search session states
  searchResult: SearchResult | null;
  lastQuery: LastQueryState | null;
  setSearchResult: (result: SearchResult | null) => void;
  setLastQuery: (query: LastQueryState | null) => void;
  resetSession: () => void;

  // Audio Player Engine
  activeTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  clearActiveTrack: () => void;

  elapsed: number;
  previewDuration: number;
  isBuffering: boolean;
  seekTrack: (seconds: number) => void;

  // Queue & playback navigation
  queue: Track[];
  queueIndex: number;
  shuffleMode: boolean;
  setQueue: (tracks: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </AuthProvider>
  );
}

function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const likesKey = likedSongsKey(session?.user.id);
  const [likedState, setLikedState] = useState(() => ({
    key: likesKey,
    tracks: readAccountLikes(likesKey),
  }));
  // Derive the new scope immediately, before effects; old-account likes never flash.
  const likedSongs =
    likedState.key === likesKey
      ? likedState.tracks
      : readAccountLikes(likesKey);
  const setLikedSongs = (update: Track[] | ((tracks: Track[]) => Track[])) => {
    setLikedState((previous) => {
      const tracks =
        previous.key === likesKey
          ? previous.tracks
          : readAccountLikes(likesKey);
      return {
        key: likesKey,
        tracks: typeof update === "function" ? update(tracks) : update,
      };
    });
  };

  // 2. Search cooldown timestamp
  const [cooldownUntil, setCooldownUntil] = useState<number>(() => {
    const saved = readLocalStorage("deezire_cooldown_until");
    const n = saved ? Number(saved) : 0;
    return Number.isFinite(n) ? n : 0;
  });

  // 3. Search results & queries persistence
  const [searchResult, setSearchResultState] = useState<SearchResult | null>(
    () => {
      try {
        const saved = readLocalStorage("deezire_last_result");
        const parsed = parseSearchResult(saved);
        if (saved && !parsed) {
          safeLocalStorageRemove("deezire_last_result");
        }
        return parsed;
      } catch (e) {
        console.error(
          "Corrupted search results in localStorage. Resetting key.",
          e,
        );
        safeLocalStorageRemove("deezire_last_result");
      }
      return null;
    },
  );

  const [lastQuery, setLastQueryState] = useState<LastQueryState | null>(() => {
    try {
      const saved = readLocalStorage("deezire_last_query");
      const parsed = parseLastQuery(saved);
      if (saved && !parsed) {
        safeLocalStorageRemove("deezire_last_query");
      }
      return parsed;
    } catch (e) {
      console.error("Corrupted last query in localStorage. Resetting key.", e);
      safeLocalStorageRemove("deezire_last_query");
    }
    return null;
  });

  // Custom Toasts and references
  const [toast, setToast] = useState<ToastState | null>(null);
  const lastUnlikedTrackRef = useRef<Track | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio elements references
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(30);
  const [isBuffering, setIsBuffering] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [shuffleMode, setShuffleMode] = useState(false);

  // Keep latest playback state available to the mount-only audio listeners
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(0);
  const shuffleModeRef = useRef(false);
  const playTrackRef = useRef<(track: Track) => void>(() => {});

  queueRef.current = queue;
  queueIndexRef.current = queueIndex;
  shuffleModeRef.current = shuffleMode;

  // Validate reads and use failure-tolerant storage helpers.
  useEffect(() => {
    setLikedState((previous) =>
      previous.key === likesKey
        ? previous
        : { key: likesKey, tracks: readAccountLikes(likesKey) },
    );
    lastUnlikedTrackRef.current = null;
    setToast((previous) =>
      previous?.actionType === "unlike" ? null : previous,
    );
  }, [likesKey]);

  useEffect(() => {
    if (likedState.key === likesKey) {
      if (!safeLocalStorageSet(likesKey, JSON.stringify(likedState.tracks))) {
        triggerToast(
          "Your likes work for this visit, but browser storage is unavailable.",
        );
      }
    }
  }, [likedState, likesKey]);

  useEffect(() => {
    safeLocalStorageSet("deezire_cooldown_until", String(cooldownUntil));
  }, [cooldownUntil]);

  // Audio playback lifecycle setup
  useEffect(() => {
    audioRef.current = new Audio();

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handleTime = () => setElapsed(audioRef.current?.currentTime || 0);
    const handleDuration = () => {
      const duration = audioRef.current?.duration;
      setPreviewDuration(duration && Number.isFinite(duration) ? duration : 30);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handleReady = () => setIsBuffering(false);
    const handleError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      triggerToast(
        "This preview could not play. Try another track or open it on Deezer.",
      );
    };
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      const q = queueRef.current;
      const idx = queueIndexRef.current;
      const shuffle = shuffleModeRef.current;

      if (q.length === 0) {
        setIsPlaying(false);
        return;
      }

      // Shuffle: always keep going — never stop just because index is last in list
      if (shuffle) {
        let nextIndex = Math.floor(Math.random() * q.length);
        while (nextIndex === idx && q.length > 1) {
          nextIndex = Math.floor(Math.random() * q.length);
        }

        // Skip tracks with no preview (up to one full pass)
        for (let attempt = 0; attempt < q.length; attempt++) {
          const candidate = q[nextIndex];
          if (candidate?.preview?.trim()) {
            queueIndexRef.current = nextIndex;
            setQueueIndex(nextIndex);
            playTrackRef.current(candidate);
            return;
          }
          nextIndex = (nextIndex + 1) % q.length;
        }
        setIsPlaying(false);
        return;
      }

      // Sequential: stop after the last track (no loop on auto-advance)
      if (idx >= q.length - 1) {
        setIsPlaying(false);
        return;
      }

      let nextIndex = idx + 1;
      for (let attempt = 0; attempt < q.length - idx; attempt++) {
        const candidate = q[nextIndex];
        if (candidate?.preview?.trim()) {
          queueIndexRef.current = nextIndex;
          setQueueIndex(nextIndex);
          playTrackRef.current(candidate);
          return;
        }
        nextIndex += 1;
        if (nextIndex >= q.length) {
          setIsPlaying(false);
          return;
        }
      }
      setIsPlaying(false);
    };

    audioRef.current.addEventListener("timeupdate", handleTime);
    audioRef.current.addEventListener("durationchange", handleDuration);
    audioRef.current.addEventListener("waiting", handleWaiting);
    audioRef.current.addEventListener("playing", handleReady);
    audioRef.current.addEventListener("canplay", handleReady);
    audioRef.current.addEventListener("error", handleError);
    audioRef.current.addEventListener("play", handlePlay);
    audioRef.current.addEventListener("pause", handlePause);
    audioRef.current.addEventListener("ended", handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", handleTime);
        audioRef.current.removeEventListener("durationchange", handleDuration);
        audioRef.current.removeEventListener("waiting", handleWaiting);
        audioRef.current.removeEventListener("playing", handleReady);
        audioRef.current.removeEventListener("canplay", handleReady);
        audioRef.current.removeEventListener("error", handleError);
        audioRef.current.removeEventListener("play", handlePlay);
        audioRef.current.removeEventListener("pause", handlePause);
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, []);

  // Update localStorage when search states modify
  const setSearchResult = (result: SearchResult | null) => {
    setSearchResultState(result);
    if (result) {
      safeLocalStorageSet("deezire_last_result", JSON.stringify(result));
    } else {
      safeLocalStorageRemove("deezire_last_result");
    }
  };

  const setLastQuery = (query: LastQueryState | null) => {
    setLastQueryState(query);
    if (query) {
      safeLocalStorageSet("deezire_last_query", JSON.stringify(query));
    } else {
      safeLocalStorageRemove("deezire_last_query");
    }
  };

  const resetSession = () => {
    setSearchResult(null);
    setLastQuery(null);
    // Force-stop audio regardless of React isPlaying lag
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setIsPlaying(false);
    setActiveTrack(null);
    setQueueState([]);
    queueRef.current = [];
    setQueueIndex(0);
    queueIndexRef.current = 0;
  };

  // Audio controls
  const playTrack = (track: Track) => {
    if (!audioRef.current || !track.preview?.trim()) return;

    if (activeTrack && activeTrack.id === track.id) {
      // Toggle play/pause for same track
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
          triggerToast(
            "This preview could not play. Try again or open it on Deezer.",
          );
        });
      }
    } else {
      // Sync queueIndex if the track exists in the current queue (ref = latest, even mid-render)
      const idxInQueue = queueRef.current.findIndex((t) => t.id === track.id);
      if (idxInQueue !== -1) {
        queueIndexRef.current = idxInQueue;
        setQueueIndex(idxInQueue);
      }

      // Play a completely new track
      audioRef.current.pause();
      setElapsed(0);
      setPreviewDuration(30);
      setActiveTrack(track);
      audioRef.current.src = track.preview;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn(
            `Could not start preview play for track ${track.id}:`,
            err,
          );
          setIsPlaying(false);
          setActiveTrack(null);
          setIsBuffering(false);
          triggerToast(
            "This preview could not play. Try another track or open it on Deezer.",
          );
        });
    }
  };
  playTrackRef.current = playTrack;

  const pauseTrack = () => {
    // Always pause the element; don't gate on React isPlaying (can lag audio events)
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const clearActiveTrack = () => {
    pauseTrack();
    setActiveTrack(null);
  };

  const seekTrack = (seconds: number) => {
    if (audioRef.current && Number.isFinite(seconds)) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(seconds, previewDuration),
      );
      setElapsed(audioRef.current.currentTime);
    }
  };

  const setQueue = (tracks: Track[]) => {
    queueRef.current = tracks;
    setQueueState(tracks);
    queueIndexRef.current = 0;
    setQueueIndex(0);
  };

  const playNext = () => {
    const q = queueRef.current;
    if (q.length === 0) return;

    let nextIndex: number;
    const currentIndex = queueIndexRef.current;

    if (shuffleModeRef.current) {
      // Pick random track that isn't current — never "runs out"
      do {
        nextIndex = Math.floor(Math.random() * q.length);
      } while (nextIndex === currentIndex && q.length > 1);
    } else {
      // Increment index, loop to 0 if at end (manual skip still loops)
      nextIndex = (currentIndex + 1) % q.length;
    }

    // Manual navigation also skips unavailable previews, matching auto-advance.
    for (
      let attempt = 0;
      attempt < q.length && !q[nextIndex]?.preview?.trim();
      attempt++
    ) {
      nextIndex = (nextIndex + 1) % q.length;
    }
    if (!q[nextIndex]?.preview?.trim()) return;
    queueIndexRef.current = nextIndex;
    setQueueIndex(nextIndex);
    playTrack(q[nextIndex]);
  };

  const playPrevious = () => {
    const q = queueRef.current;
    if (q.length === 0) return;

    let prevIndex: number;
    const currentIndex = queueIndexRef.current;

    if (shuffleModeRef.current) {
      do {
        prevIndex = Math.floor(Math.random() * q.length);
      } while (prevIndex === currentIndex && q.length > 1);
    } else {
      prevIndex = currentIndex === 0 ? q.length - 1 : currentIndex - 1;
    }

    for (
      let attempt = 0;
      attempt < q.length && !q[prevIndex]?.preview?.trim();
      attempt++
    ) {
      prevIndex = (prevIndex - 1 + q.length) % q.length;
    }
    if (!q[prevIndex]?.preview?.trim()) return;
    queueIndexRef.current = prevIndex;
    setQueueIndex(prevIndex);
    playTrack(q[prevIndex]);
  };

  const toggleShuffle = () => {
    setShuffleMode((prev) => {
      const next = !prev;
      shuffleModeRef.current = next;
      return next;
    });
  };

  const likeTrack = (track: Track) => {
    if (likedSongs.some((s) => s.id === track.id)) return;
    setLikedSongs((prev) => [...prev, track]);
    triggerToast(
      `Liked "${track.title_short || track.title}"`,
      undefined,
      "generic",
    );
  };

  const unlikeTrack = (trackId: number) => {
    const trackToRemove = likedSongs.find((s) => s.id === trackId);
    if (!trackToRemove) return;

    lastUnlikedTrackRef.current = trackToRemove;
    setLikedSongs((prev) => prev.filter((s) => s.id !== trackId));

    triggerToast(
      `Removed "${trackToRemove.title_short || trackToRemove.title}"`,
      trackToRemove,
      "unlike",
    );
  };

  const undoUnlike = () => {
    if (!lastUnlikedTrackRef.current) return;
    const trackToRestore = lastUnlikedTrackRef.current;

    setLikedSongs((prev) => {
      if (prev.some((s) => s.id === trackToRestore.id)) return prev;
      return [...prev, trackToRestore];
    });

    lastUnlikedTrackRef.current = null;
    setToast(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  };

  const triggerToast = (
    message: string,
    track?: Track,
    actionType: "unlike" | "generic" = "generic",
  ) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({
      message,
      visible: true,
      track,
      actionType,
      key: Date.now(),
    });

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      lastUnlikedTrackRef.current = null;
    }, 8000);
  };

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    },
    [],
  );

  const clearToast = () => {
    setToast(null);
    lastUnlikedTrackRef.current = null;
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  };

  const setSearchCooldown = (seconds: number) => {
    setCooldownUntil(Date.now() + seconds * 1000);
  };

  const isCooldownActive = () => {
    return Date.now() < cooldownUntil;
  };

  const getCooldownRemaining = () => {
    const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  return (
    <AppContext.Provider
      value={{
        likedSongs,
        likeTrack,
        unlikeTrack,
        undoUnlike,
        toast,
        triggerToast,
        clearToast,
        cooldownUntil,
        setSearchCooldown,
        isCooldownActive,
        getCooldownRemaining,
        searchResult,
        lastQuery,
        setSearchResult,
        setLastQuery,
        resetSession,
        activeTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        clearActiveTrack,
        queue,
        queueIndex,
        shuffleMode,
        setQueue,
        playNext,
        playPrevious,
        toggleShuffle,
        elapsed,
        previewDuration,
        isBuffering,
        seekTrack,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
