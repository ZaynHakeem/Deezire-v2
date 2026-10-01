import { CSSProperties } from "react";
import { MOOD_PRESENTATION } from "../config/moodPresentation";
import { MoodType } from "../types";

export function MoodMark({ mood }: { mood: MoodType }) {
  return (
    <span
      className="mood-mark"
      aria-hidden="true"
      style={
        { "--mark-color": MOOD_PRESENTATION[mood].color } as CSSProperties
      }
    />
  );
}
