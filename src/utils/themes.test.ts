import { describe, expect, it } from "vitest";
import { detectEmotion, classifyMoodFromText } from "./themes";

describe("detectEmotion", () => {
  it("maps grief trigger words to Heartbroken without showing Died as the label", () => {
    const result = detectEmotion("my friend died last week");
    expect(result.mood).toBe("Heartbroken");
    expect(result.label).toBe("Heartbroken");
  });

  it("maps dog died to Heartbroken", () => {
    const result = detectEmotion("my dog died");
    expect(result.mood).toBe("Heartbroken");
    expect(result.label).toBe("Heartbroken");
  });

  it("keeps real feeling words as the display label", () => {
    const result = detectEmotion("I feel so sad and lonely");
    expect(result.mood).toBe("Heartbroken");
    expect(result.label).not.toBeNull();
    expect(["Sad", "Lonely", "Heartbroken"]).toContain(result.label);
  });

  it("detects anxious moods", () => {
    expect(detectEmotion("feeling anxious and stressed").mood).toBe("Anxious");
  });

  it("detects happy moods", () => {
    expect(detectEmotion("I am so happy and joyful today").mood).toBe("Happy");
  });
});

describe("classifyMoodFromText", () => {
  it("returns only the mood bucket", () => {
    expect(classifyMoodFromText("funeral tomorrow")).toBe("Heartbroken");
  });
});
