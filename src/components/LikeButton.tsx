import { Heart } from "lucide-react";
import { useRef } from "react";
import { Track } from "../types";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";

export function LikeButton({ track }: { track: Track }) {
  const { likedSongs, likeTrack, unlikeTrack } = useApp();
  const { session } = useAuth();
  const scopeRef = useRef(session?.user.id);
  scopeRef.current = session?.user.id;
  const confirm = useConfirm();
  const liked = likedSongs.some((t) => t.id === track.id);
  const toggle = async () => {
    if (!liked) {
      likeTrack(track);
      return;
    }
    const scope = scopeRef.current;
    if (
      await confirm({
        title: "Remove from liked songs?",
        description: `“${track.title}” will leave your collection. You can undo this afterward.`,
        confirmLabel: "Remove song",
        cancelLabel: "Keep song",
      })
    ) {
      if (scope !== scopeRef.current) return;
      unlikeTrack(track.id);
      requestAnimationFrame(() => {
        if (document.activeElement === document.body)
          document.querySelector<HTMLElement>("main h1")?.focus();
      });
    }
  };
  return (
    <button
      type="button"
      className={`icon-button like-button ${liked ? "is-liked" : ""}`}
      onClick={toggle}
      aria-pressed={liked}
      aria-label={liked ? `Unlike ${track.title}` : `Like ${track.title}`}
    >
      <Heart size={20} fill={liked ? "currentColor" : "none"} />
    </button>
  );
}
