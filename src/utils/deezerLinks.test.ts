import { describe, expect, it } from "vitest";
import { getDeezerTrackUrl } from "./deezerLinks";

describe("getDeezerTrackUrl", () => {
  it("uses the API link when present", () => {
    expect(
      getDeezerTrackUrl({ id: 1, link: "https://www.deezer.com/track/99" })
    ).toBe("https://www.deezer.com/track/99");
  });

  it("falls back to track id when link is missing or blank", () => {
    expect(getDeezerTrackUrl({ id: 42 })).toBe("https://www.deezer.com/track/42");
    expect(getDeezerTrackUrl({ id: 7, link: "  " })).toBe(
      "https://www.deezer.com/track/7"
    );
  });
});
