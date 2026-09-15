import { describe, expect, it } from "vitest";
import {
  parseLikedSongs,
  parseSearchResult,
  parseLastQuery,
  isValidTrack,
} from "./storageGuards";

describe("storageGuards", () => {
  it("accepts a valid track shape", () => {
    expect(
      isValidTrack({
        id: 1,
        title: "Song",
        duration: 120,
        preview: "https://example.com/p.mp3",
        artist: { id: 1, name: "Artist" },
        album: { id: 1, title: "Album" },
      })
    ).toBe(true);
  });

  it("rejects corrupt liked songs JSON", () => {
    expect(parseLikedSongs("{not json")).toEqual([]);
    expect(parseLikedSongs(JSON.stringify([{ id: 1 }]))).toEqual([]);
  });

  it("rejects invalid search results", () => {
    expect(parseSearchResult(JSON.stringify({ tracks: [] }))).toBeNull();
  });

  it("parses a valid last query", () => {
    const q = parseLastQuery(
      JSON.stringify({ rawText: "sad", mood: "Heartbroken", mode: "feel" })
    );
    expect(q?.mood).toBe("Heartbroken");
  });
});
