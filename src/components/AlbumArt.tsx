import { useState } from "react";
import { Disc3 } from "lucide-react";
import { Track } from "../types";

export function AlbumArt({
  track,
  large = false,
  decorative = false,
}: {
  track: Track;
  large?: boolean;
  decorative?: boolean;
}) {
  const source =
    (large && track.album.cover_big) ||
    track.album.cover_medium ||
    track.album.cover_small;
  const [failedSource, setFailedSource] = useState<string | undefined>();
  return (
    <span className="album-art">
      {source && source !== failedSource ? (
        <img
          src={source}
          width={large ? 500 : 112}
          height={large ? 500 : 112}
          alt={
            decorative ? "" : `${track.album.title || track.title} album cover`
          }
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <Disc3
          size={large ? 80 : 28}
          aria-label={decorative ? undefined : "Album artwork unavailable"}
          aria-hidden={decorative}
        />
      )}
    </span>
  );
}
