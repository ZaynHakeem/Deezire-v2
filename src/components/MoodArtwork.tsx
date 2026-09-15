import { CSSProperties } from "react";

/** CSS artwork: no download, no raster layout shift, no continuous idle motion. */
export function MoodArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`mood-artwork ${compact ? "compact" : ""}`}
      aria-hidden="true"
    >
      <div className="artwork-grid" />
      <div className="frequency-ribbon">
        {Array.from({ length: 27 }, (_, i) => (
          <i
            key={i}
            style={
              {
                "--i": i,
                "--bar-height": `${32 + Math.sin(i / 4) * 18 + Math.sin(i / 2.5) * 9}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="artwork-orbit" />
      <span className="artwork-word">
        feel
        <br />
        something.
      </span>
      <span className="artwork-code">DEEZIRE — EMOTIONAL FREQUENCIES</span>
    </div>
  );
}
