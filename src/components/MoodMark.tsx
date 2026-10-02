import { CSSProperties } from "react";
import { MOOD_PRESENTATION } from "../config/moodPresentation";
import { MoodType } from "../types";

const WAVES: Record<MoodType, number[]> = {
  Heartbroken: [12, 8, 5, 3, 2],
  Anxious: [3, 13, 4, 12, 2],
  Happy: [6, 12, 7, 12, 6],
  Energetic: [8, 14, 5, 14, 9],
  Focused: [7, 9, 7, 9, 7],
  Nostalgic: [4, 8, 12, 8, 4],
  Angry: [14, 3, 13, 4, 12],
  Peaceful: [3, 5, 7, 5, 3],
};

const WAVE_DURATION: Record<MoodType, string> = {
  Heartbroken: "2.6s",
  Anxious: "0.9s",
  Happy: "1.25s",
  Energetic: "0.75s",
  Focused: "1.6s",
  Nostalgic: "2.2s",
  Angry: "0.7s",
  Peaceful: "3s",
};

export function MoodMark({ mood }: { mood: MoodType }) {
  const bars = WAVES[mood];
  const gap = 1.6;
  const barWidth = (20 - gap * (bars.length - 1)) / bars.length;
  const sequence = [...bars, ...bars];
  return (
    <span
      className="mood-mark"
      aria-hidden="true"
      style={
        {
          "--mark-color": MOOD_PRESENTATION[mood].color,
          "--wave-duration": WAVE_DURATION[mood],
        } as CSSProperties
      }
    >
      <svg viewBox="0 0 40 14" fill="currentColor" aria-hidden="true">
        {sequence.map((level, index) => {
          const place = index % bars.length;
          return (
            <rect
              key={index}
              x={place * (barWidth + gap) + Math.floor(index / bars.length) * 20}
              y={14 - level}
              width={barWidth}
              height={level}
              rx="1.2"
              style={{ animationDelay: `${-place * 0.14}s` }}
            />
          );
        })}
      </svg>
    </span>
  );
}
