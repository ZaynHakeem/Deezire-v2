import { describe, expect, it } from "vitest";
import { connectionAllowsPreload, analyzeEmotion } from "./emotionClassifier";

describe("connectionAllowsPreload", () => {
  it("returns true when Network Information API is unavailable", () => {
    expect(connectionAllowsPreload()).toBe(true);
  });
});

describe("analyzeEmotion keyword fallback", () => {
  it("uses keyword path when the ML model is not loaded", async () => {
    const result = await analyzeEmotion("my cousin died last week");
    expect(result.mood).toBe("Heartbroken");
    expect(result.source).toBe("keyword");
    expect(result.label).toBe("Heartbroken");
  });
});
