import { describe, expect, it } from "vitest";
import { translateQuery } from "./deezer";

describe("translateQuery", () => {
  it("maps heartbroken scenarios to acoustic ballad descriptors", () => {
    expect(translateQuery("I am heartbroken")).toBe("acoustic ballad piano emotional");
  });

  it("maps grief to classical piano", () => {
    expect(translateQuery("grief")).toBe("classical piano slow orchestral");
  });

  it("falls back for unknown short input", () => {
    expect(translateQuery("xyzzy")).toBe("xyzzy");
  });

  it("defaults empty input to chill", () => {
    expect(translateQuery("   ")).toBe("chill");
  });
});
