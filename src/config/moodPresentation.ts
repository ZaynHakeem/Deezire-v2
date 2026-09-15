import { MoodType } from "../types";
import { MOOD_THEMES } from "../utils/themes";

/** Presentation only. Search queries and emotion mapping stay in MOOD_THEMES. */
export const MOOD_PRESENTATION: Record<
  MoodType,
  {
    color: string;
    soft: string;
    caption: string;
    feel: string;
    shift: string;
    mix: string;
  }
> = {
  Heartbroken: {
    color: "#93b4ff",
    soft: "#18294d",
    caption: "Let it all out",
    feel: "Melancholy melodies. A little company for the ache.",
    shift: "Uplifting pop. Find a little light on the other side.",
    mix: "A place to fall apart.",
  },
  Anxious: {
    color: "#70dfd5",
    soft: "#103a3c",
    caption: "One breath at a time",
    feel: "Quiet soundscapes. Make some room to breathe.",
    shift: "Gentle lofi grooves. Give a busy mind a new rhythm.",
    mix: "A little breathing room.",
  },
  Happy: {
    color: "#ffce75",
    soft: "#493015",
    caption: "Bottle this feeling",
    feel: "Feel-good favorites. Keep the sunshine going.",
    shift: "Mellow acoustics. Settle into a softer kind of good.",
    mix: "Stay on the bright side.",
  },
  Energetic: {
    color: "#e798ff",
    soft: "#441251",
    caption: "Turn it all the way up",
    feel: "Big beats. Meet your energy at full volume.",
    shift: "Soft piano. Find your way back to a slower pace.",
    mix: "Good energy. No limits.",
  },
  Focused: {
    color: "#77e2bf",
    soft: "#103a31",
    caption: "Find your flow",
    feel: "Steady rhythms. A soundtrack for getting in the zone.",
    shift: "Driving rock. Step out of your head for a minute.",
    mix: "Less noise. More flow.",
  },
  Nostalgic: {
    color: "#f0b486",
    soft: "#44251c",
    caption: "Somewhere, sometime",
    feel: "Old favorites. Go back to a feeling you remember.",
    shift: "Fresh sounds. Make room for your next favorite.",
    mix: "Feels like a memory.",
  },
  Angry: {
    color: "#ff939d",
    soft: "#461521",
    caption: "Give it somewhere to go",
    feel: "Heavy riffs and bass. Let the music meet the intensity.",
    shift: "Peaceful textures. Take the temperature down.",
    mix: "Let the volume speak.",
  },
  Peaceful: {
    color: "#b8e6ba",
    soft: "#1e3c2c",
    caption: "Stay a little longer",
    feel: "Gentle vocals and acoustics. Keep the world on pause.",
    shift: "Bouncy grooves. Put a little motion in your moment.",
    mix: "Nothing to rush.",
  },
};
export const MOODS = Object.keys(MOOD_THEMES) as MoodType[];
