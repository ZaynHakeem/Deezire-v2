// @vitest-environment jsdom
import { act, createElement, Fragment } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Home } from "./Home";
import { Navigation } from "../components/Navigation";
import { getMoodSongs, DeezerNetworkError } from "../services/deezer";
import { preloadEmotionModel } from "../services/emotionClassifier";
import {
  mount,
  sampleTrack,
  setupDom,
  click,
  button,
  inputValue,
} from "../test/helpers";

vi.mock("../services/deezer", async (importOriginal) => {
  const original = await importOriginal<typeof import("../services/deezer")>();
  return { ...original, getMoodSongs: vi.fn() };
});
vi.mock("../services/emotionClassifier", () => ({
  analyzeEmotion: vi.fn(async () => ({
    mood: "Heartbroken",
    label: "Sadness",
    query: "acoustic ballad",
    source: "keyword",
  })),
  preloadEmotionModel: vi.fn(async () => {}),
  connectionAllowsPreload: () => true,
  isModelReady: () => false,
}));
// Remove transition timing from state-machine tests; the shipped app still uses motion.
vi.mock("motion/react", async () => {
  const React = await import("react");
  const cache: Record<string, unknown> = {};
  return {
    AnimatePresence: ({ children }: { children: unknown }) => children,
    motion: new Proxy(
      {},
      {
        get: (_, tag: string) =>
          (cache[tag] ||= React.forwardRef((props: any, ref) => {
            const {
              initial: _initial,
              animate: _animate,
              exit: _exit,
              transition: _transition,
              ...rest
            } = props;
            return React.createElement(tag, { ...rest, ref });
          })),
      },
    ),
  };
});
let screen: Awaited<ReturnType<typeof mount>> | undefined;
beforeEach(() => {
  setupDom();
  vi.clearAllMocks();
  vi.useFakeTimers();
});
afterEach(async () => {
  await screen?.unmount();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const nextCooldown = async () => {
  await act(async () => {
    vi.advanceTimersByTime(5100);
  });
};
const choose = async (mood: string) => {
  const chip = screen!.host.querySelector<HTMLButtonElement>(
    `.mood-chip:nth-child(${["Heartbroken", "Anxious", "Happy", "Energetic", "Focused", "Nostalgic", "Angry", "Peaceful"].indexOf(mood) + 1})`,
  )!;
  await click(chip);
};
it("does not preload the model on mount or mood-chip selection", async () => {
  screen = await mount(createElement(Home));
  expect(preloadEmotionModel).not.toHaveBeenCalled();
  await choose("Peaceful");
  expect(screen.host.querySelector("h1")!.textContent).toContain("peaceful");
  expect(preloadEmotionModel).not.toHaveBeenCalled();
});
it("submits typed text with Enter, keeps Shift+Enter for newlines, and defers preload to submission", async () => {
  screen = await mount(createElement(Home));
  const textarea = screen.host.querySelector("textarea")!;
  await inputValue(textarea, "I am feeling sad");
  await act(async () => {
    textarea.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        shiftKey: true,
        bubbles: true,
      }),
    );
  });
  expect(preloadEmotionModel).not.toHaveBeenCalled();
  await act(async () => {
    textarea.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
  });
  expect(preloadEmotionModel).toHaveBeenCalledTimes(1);
  expect(screen.app.lastQuery?.rawText).toBe("I am feeling sad");
  expect(screen.host.querySelector("h1")!.textContent).toContain("heartbroken");
});
it("keeps results visible after a failed reshuffle and provides a dismissible error", async () => {
  vi.mocked(getMoodSongs).mockResolvedValueOnce({
    tracks: [sampleTrack(1)],
    queryUsed: "calm",
  });
  screen = await mount(createElement(Home));
  await choose("Peaceful");
  await click(screen.host.querySelector(".direction-feel")!);
  expect(screen.host.querySelectorAll(".track-row")).toHaveLength(1);
  expect(screen.host.querySelector(".cooldown-ring")).not.toBeNull();
  await nextCooldown();
  vi.mocked(getMoodSongs).mockRejectedValueOnce(
    new DeezerNetworkError("offline"),
  );
  await click(button(screen.host, "Find more songs"));
  expect(screen.host.querySelector("dialog")!.open).toBe(true);
  await click(button(screen.host.querySelector("dialog")!, "Find more songs"));
  expect(screen.host.querySelectorAll(".track-row")).toHaveLength(1);
  expect(screen.host.querySelector(".error-screen")).toBeNull();
  expect(screen.host.querySelector('[role="alert"]')!.textContent).toContain(
    "current mix is still here",
  );
  await click(button(screen.host, "Dismiss refresh error"));
  expect(screen.host.querySelector('[role="alert"]')).toBeNull();
});
it("ignores an old response after canceling and starting a new mood search", async () => {
  let resolveOld: (value: any) => void = () => {};
  vi.mocked(getMoodSongs).mockReturnValueOnce(
    new Promise((resolve) => {
      resolveOld = resolve;
    }),
  );
  screen = await mount(createElement(Home));
  await choose("Peaceful");
  await click(screen.host.querySelector(".direction-feel")!);
  expect(screen.host.querySelector(".loading-screen")).not.toBeNull();
  await click(button(screen.host, "Change mood"));
  await choose("Happy");
  await nextCooldown();
  vi.mocked(getMoodSongs).mockResolvedValueOnce({
    tracks: [sampleTrack(9)],
    queryUsed: "happy",
  });
  await click(screen.host.querySelector(".direction-shift")!);
  expect(screen.app.searchResult?.mood).toBe("Happy");
  await act(async () =>
    resolveOld({ tracks: [sampleTrack(1)], queryUsed: "old search" }),
  );
  expect(screen.app.searchResult?.tracks[0].id).toBe(9);
  expect(screen.app.searchResult?.mood).toBe("Happy");
});
it("returns to an empty home screen when the wordmark is tapped", async () => {
  let resolveLate: (value: {
    tracks: ReturnType<typeof sampleTrack>[];
    queryUsed: string;
  }) => void = () => {};
  vi.mocked(getMoodSongs)
    .mockResolvedValueOnce({
      tracks: [sampleTrack(1)],
      queryUsed: "calm",
    })
    .mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLate = resolve;
      }),
    );
  screen = await mount(
    createElement(
      Fragment,
      null,
      createElement(Navigation),
      createElement(Home),
    ),
  );
  await choose("Peaceful");
  await click(screen.host.querySelector(".direction-feel")!);
  expect(screen.host.querySelectorAll(".track-row")).toHaveLength(1);
  await click(screen.host.querySelector('[aria-label="Deezire home"]')!);
  expect(screen.host.querySelector("h1")!.textContent).toContain("Every feeling");
  expect(screen.host.querySelector("textarea")!.value).toBe("");
  expect(screen.app.searchResult).toBeNull();
  expect(screen.app.lastQuery).toBeNull();
  expect(localStorage.getItem("deezire_last_result")).toBeNull();
  expect(localStorage.getItem("deezire_last_query")).toBeNull();
  await nextCooldown();
  await choose("Happy");
  await click(screen.host.querySelector(".direction-feel")!);
  expect(screen.host.querySelector(".loading-screen")).not.toBeNull();
  await click(screen.host.querySelector('[aria-label="Deezire home"]')!);
  expect(screen.host.querySelector("textarea")).not.toBeNull();
  await act(async () =>
    resolveLate({ tracks: [sampleTrack(4)], queryUsed: "late" }),
  );
  expect(screen.app.searchResult).toBeNull();
  expect(screen.host.querySelector(".track-row")).toBeNull();
});
it("provides a full error screen with retry and type-again paths for an initial failure", async () => {
  vi.mocked(getMoodSongs).mockRejectedValueOnce(
    new DeezerNetworkError("offline"),
  );
  screen = await mount(createElement(Home));
  await choose("Happy");
  await click(screen.host.querySelector(".direction-feel")!);
  expect(screen.host.querySelector(".error-screen")).not.toBeNull();
  expect(button(screen.host, "Type again")).not.toBeNull();
  await nextCooldown();
  expect(button(screen.host, "Try again").disabled).toBe(false);
  await click(button(screen.host, "Type again"));
  expect(screen.host.querySelector("textarea")).not.toBeNull();
});
