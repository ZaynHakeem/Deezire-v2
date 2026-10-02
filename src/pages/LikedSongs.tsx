import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Search, Play, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { isSupabaseAuth } from "../services/supabase";
import { TrackList } from "../components/TrackList";

export function LikedSongs() {
  const { likedSongs, setQueue, playTrack } = useApp();
  const { session, authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const tracks = likedSongs.filter((t) =>
    `${t.title} ${t.artist.name} ${t.album.title}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const firstPlayable = tracks.find((t) => t.preview?.trim());
  return (
    <div className="page-shell liked-page">
      <div className="collection-hero">
        <div className="collection-art" aria-hidden="true">
          <Heart size={100} strokeWidth={1.1} />
          <span>YOURS, ON REPEAT.</span>
        </div>
        <div>
          <span className="eyebrow">THE ONES THAT STAY WITH YOU</span>
          <h1 tabIndex={-1}>
            Liked <span className="gradient-text">songs.</span>
          </h1>
          <p className="lead">
            A collection of moments you want to hear again.
          </p>
          <p className="collection-meta" aria-live="polite">
            {authLoading
              ? "Opening your collection…"
              : `${likedSongs.length} ${likedSongs.length === 1 ? "song" : "songs"} · ${session ? session.user.email : "Guest collection"} · ${session && isSupabaseAuth ? "Your account" : "This browser"}`}
          </p>
        </div>
      </div>
      {!session && !authLoading && (
        <div className="collection-note">
          <Heart size={18} />
          <p>
            Your guest favorites are saved here.{" "}
            <Link to="/signup">
              Create a separate account collection
              <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      )}
      {likedSongs.length > 0 ? (
        <>
          <div className="collection-toolbar">
            <div className="collection-search">
              <label htmlFor="liked-search">Search your collection</label>
              <div className="input-wrap">
                <Search size={18} />
                <input
                  type="search"
                  id="liked-search"
                  placeholder="Song, artist, or album"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    className="icon-button"
                    onClick={() => setQuery("")}
                    aria-label="Clear collection search"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </div>
            <button
              className="button primary"
              disabled={!firstPlayable}
              onClick={() => {
                if (firstPlayable) {
                  setQueue(tracks);
                  playTrack(firstPlayable);
                }
              }}
            >
              <Play size={17} fill="currentColor" />
              Play {query ? "matches" : "favorites"}
            </button>
          </div>
          {query && (
            <p className="filter-status" role="status">
              {tracks.length} {tracks.length === 1 ? "match" : "matches"} for “
              {query}”
            </p>
          )}
          {tracks.length ? (
            <TrackList tracks={tracks} />
          ) : (
            <div className="empty-state">
              <Search size={32} />
              <h2>No songs found.</h2>
              <p>Try another title, artist, or album.</p>
              <button className="text-button" onClick={() => setQuery("")}>
                Show all liked songs
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state liked-empty">
          <span className="state-icon">
            <Heart size={32} />
          </span>
          <h2>Your next favorite is out there.</h2>
          <p>
            Tap the heart beside any song.
            <br />
            We’ll keep it right here for you.
          </p>
          <Link to="/" className="button primary">
            Discover your soundtrack
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
export default LikedSongs;
