import { useState } from "react";
import {
  ChevronUp,
  ExternalLink,
  Loader2,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AlbumArt } from "./AlbumArt";
import { LikeButton } from "./LikeButton";
import { NowPlaying } from "./NowPlaying";
import { getDeezerTrackUrl } from "../utils/deezerLinks";
import { formatTime } from "./TrackList";

export function PlayerBar() {
  const {
    activeTrack,
    isPlaying,
    isBuffering,
    playTrack,
    playNext,
    playPrevious,
    toggleShuffle,
    shuffleMode,
    elapsed,
    previewDuration,
    queue,
  } = useApp();
  const [expanded, setExpanded] = useState(false);
  if (!activeTrack) return null;
  return (
    <>
      <NowPlaying isOpen={expanded} onClose={() => setExpanded(false)} />
      <section className="player-bar" aria-label="Music preview player">
        <progress
          className="player-progress"
          value={elapsed}
          max={previewDuration}
          aria-label="Preview playback progress"
        />
        <div className="player-inner">
          <button
            className="player-track"
            onClick={() => setExpanded(true)}
            aria-label={`Expand now playing: ${activeTrack.title} by ${activeTrack.artist.name}`}
          >
            <AlbumArt track={activeTrack} decorative />
            <span>
              <strong>{activeTrack.title}</strong>
              <small>{activeTrack.artist.name}</small>
            </span>
            <ChevronUp size={16} />
          </button>
          <div className="player-controls">
            <button
              className="icon-button player-shuffle"
              onClick={toggleShuffle}
              aria-label={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
              aria-pressed={shuffleMode}
            >
              <Shuffle size={18} />
            </button>
            <button
              className="icon-button player-previous"
              onClick={playPrevious}
              disabled={!queue.length}
              aria-label="Previous track"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              className="play-main"
              onClick={() => playTrack(activeTrack)}
              disabled={!activeTrack.preview?.trim()}
              title={
                activeTrack.preview?.trim()
                  ? "30-second preview"
                  : "No preview available"
              }
              aria-label={
                isPlaying
                  ? `Pause ${activeTrack.title}`
                  : `Play 30-second preview of ${activeTrack.title}`
              }
            >
              {isBuffering ? (
                <Loader2 className="spin" size={21} />
              ) : isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" />
              )}
            </button>
            <button
              className="icon-button"
              onClick={playNext}
              disabled={!queue.length}
              aria-label="Next track"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
            <span className="player-like">
              <LikeButton track={activeTrack} />
            </span>
          </div>
          <div className="player-extra">
            <span className="preview-pill">30s preview</span>
            <span className="player-time">
              {formatTime(elapsed)} / {formatTime(previewDuration)}
            </span>
            <a
              className="icon-button"
              href={getDeezerTrackUrl(activeTrack)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${activeTrack.title} on Deezer (new tab)`}
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
