import { Clock3, ExternalLink, Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import { Track } from "../types";
import { useApp } from "../context/AppContext";
import { AlbumArt } from "./AlbumArt";
import { ExplicitBadge } from "./ExplicitBadge";
import { LikeButton } from "./LikeButton";
import { Equalizer } from "./Equalizer";
import { getDeezerTrackUrl } from "../utils/deezerLinks";

export const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
export function TrackList({ tracks }: { tracks: Track[] }) {
  const { activeTrack, isPlaying, playTrack, setQueue } = useApp();
  return (
    <div className="track-list">
      <div className="track-head" aria-hidden="true">
        <span>#</span>
        <span>TRACK / ARTIST</span>
        <span className="track-album">ALBUM</span>
        <span>
          <Clock3 size={15} />
        </span>
        <span />
      </div>
      <ol aria-label="Songs in this collection">
        {tracks.map((track, index) => {
          const playing = activeTrack?.id === track.id && isPlaying;
          const hasPreview = !!track.preview?.trim();
          return (
            <motion.li
              key={track.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(index * 0.025, 0.25) }}
              className={`track-row ${playing ? "track-playing" : ""}`}
            >
              <span className="track-number" aria-hidden="true">
                {playing ? <Equalizer /> : String(index + 1).padStart(2, "0")}
              </span>
              <div className="track-details">
                <AlbumArt track={track} />
                <div className="track-text">
                  <p className="track-title">
                    <span>{track.title}</span>
                    <ExplicitBadge explicit={track.explicit_lyrics} />
                  </p>
                  <p className="track-artist">{track.artist.name}</p>
                  <span className="mobile-album">{track.album.title}</span>
                </div>
              </div>
              <span className="track-album truncate">{track.album.title}</span>
              <span className="track-duration">
                {formatTime(track.duration)}
              </span>
              <div className="track-actions">
                <LikeButton track={track} />
                <button
                  className={`icon-button track-play ${playing ? "active" : ""}`}
                  disabled={!hasPreview}
                  title={
                    hasPreview ? "30-second preview" : "No preview available"
                  }
                  aria-label={
                    !hasPreview
                      ? `No preview available for ${track.title}`
                      : playing
                        ? `Pause ${track.title}`
                        : `Play 30-second preview of ${track.title}`
                  }
                  onClick={() => {
                    if (activeTrack?.id !== track.id) setQueue(tracks);
                    playTrack(track);
                  }}
                >
                  {playing ? (
                    <Pause size={17} fill="currentColor" />
                  ) : (
                    <Play size={17} fill="currentColor" />
                  )}
                </button>
                <a
                  className="icon-button track-external"
                  href={getDeezerTrackUrl(track)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${track.title} on Deezer (new tab)`}
                >
                  <ExternalLink size={17} />
                </a>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
