import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { useDialog } from "../hooks/useDialog";
import { getDeezerTrackUrl } from "../utils/deezerLinks";
import { AlbumArt } from "./AlbumArt";
import { LikeButton } from "./LikeButton";
import { ExplicitBadge } from "./ExplicitBadge";
import { formatTime } from "./TrackList";

export function NowPlaying({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    activeTrack,
    isPlaying,
    isBuffering,
    playTrack,
    playNext,
    playPrevious,
    queue,
    queueIndex,
    toggleShuffle,
    shuffleMode,
    elapsed,
    previewDuration,
    seekTrack,
  } = useApp();
  const dialog = useDialog(isOpen && !!activeTrack);
  if (!isOpen || !activeTrack) return null;
  const hasPreview = !!activeTrack.preview?.trim();
  return (
    <dialog
      ref={dialog}
      className="now-playing-dialog"
      aria-modal="true"
      aria-labelledby="now-playing-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="now-playing-header">
        <button
          autoFocus
          className="icon-button"
          aria-label="Close now playing"
          onClick={onClose}
        >
          <ChevronDown size={24} />
        </button>
        <div>
          <span className="eyebrow">IN YOUR MOMENT</span>
          <h2 id="now-playing-title">Now playing</h2>
        </div>
        <span className="preview-pill">30s preview</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="now-playing-layout"
      >
        <div className="now-playing-art">
          <AlbumArt track={activeTrack} large />
        </div>
        <div className="now-playing-details">
          <div className="now-track-title">
            <div>
              <h3>
                {activeTrack.title}
                <ExplicitBadge explicit={activeTrack.explicit_lyrics} />
              </h3>
              <p>{activeTrack.artist.name}</p>
              <small>{activeTrack.album.title}</small>
            </div>
            <LikeButton track={activeTrack} />
          </div>
          <div className="seek-control">
            <label className="sr-only" htmlFor="preview-seek">
              Seek within preview
            </label>
            <input
              id="preview-seek"
              type="range"
              min={0}
              max={previewDuration}
              step={0.1}
              value={Math.min(elapsed, previewDuration)}
              disabled={!hasPreview}
              onChange={(e) => seekTrack(Number(e.target.value))}
              aria-valuetext={`${formatTime(elapsed)} of ${formatTime(previewDuration)}`}
            />
            <div>
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(previewDuration)}</span>
            </div>
          </div>
          <div className="now-controls">
            <button
              className="icon-button"
              onClick={toggleShuffle}
              aria-label={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
              aria-pressed={shuffleMode}
            >
              <Shuffle size={23} />
            </button>
            <button
              className="icon-button"
              onClick={playPrevious}
              disabled={!queue.length}
              aria-label="Previous track"
            >
              <SkipBack size={26} fill="currentColor" />
            </button>
            <button
              className="play-main"
              onClick={() => playTrack(activeTrack)}
              disabled={!hasPreview}
              title={hasPreview ? "30-second preview" : "No preview available"}
              aria-label={
                isPlaying
                  ? `Pause ${activeTrack.title}`
                  : `Play 30-second preview of ${activeTrack.title}`
              }
            >
              {isBuffering ? (
                <Loader2 className="spin" size={27} />
              ) : isPlaying ? (
                <Pause size={27} fill="currentColor" />
              ) : (
                <Play size={27} fill="currentColor" />
              )}
            </button>
            <button
              className="icon-button"
              onClick={playNext}
              disabled={!queue.length}
              aria-label="Next track"
            >
              <SkipForward size={26} fill="currentColor" />
            </button>
            <Volume2
              size={23}
              className="volume-decoration"
              aria-hidden="true"
            />
          </div>
          <p className="queue-note" aria-live="polite">
            {isBuffering
              ? "Loading this preview…"
              : queue.length
                ? `Track ${queueIndex + 1} of ${queue.length} · ${shuffleMode ? "Shuffle on" : "Playing in order"}`
                : "Preview player"}
          </p>
          <a
            className="button secondary full-track-link"
            href={getDeezerTrackUrl(activeTrack)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Hear the full song on Deezer
            <ExternalLink size={17} />
          </a>
        </div>
      </motion.div>
    </dialog>
  );
}
export default NowPlaying;
