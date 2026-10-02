// @vitest-environment jsdom
import { act, createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mount, MockAudio, sampleTrack, setupDom } from "../test/helpers";
import { likedSongsKey, readAccountLikes } from "../utils/accountStorage";
import { TrackList } from "../components/TrackList";

let screen: Awaited<ReturnType<typeof mount>> | undefined;
beforeEach(setupDom);
afterEach(async () => {
  await screen?.unmount();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("preserves legacy guest likes across two accounts, sign-out, reload, and undo", async () => {
  localStorage.setItem(likedSongsKey(), JSON.stringify([sampleTrack(1)]));
  screen = await mount();
  expect(screen.app.likedSongs.map((t) => t.id)).toEqual([1]);
  await act(async () =>
    screen!.auth.signUp({
      email: "first@example.test",
      password: "Demo-pass1!",
    }),
  );
  const firstId = screen.auth.session!.user.id;
  expect(screen.app.likedSongs).toEqual([]);
  await act(async () => screen!.app.likeTrack(sampleTrack(2)));
  expect(readAccountLikes(likedSongsKey(firstId)).map((t) => t.id)).toEqual([
    2,
  ]);
  await act(async () => screen!.app.unlikeTrack(2));
  await act(async () => screen!.auth.signOut());
  await act(async () => screen!.app.undoUnlike());
  expect(screen.app.likedSongs.map((t) => t.id)).toEqual([1]);
  await act(async () =>
    screen!.auth.signUp({
      email: "second@example.test",
      password: "Demo-pass1!",
    }),
  );
  expect(screen.app.likedSongs).toEqual([]);
  await act(async () => screen!.app.likeTrack(sampleTrack(3)));
  await screen.unmount();
  screen = await mount();
  expect(screen.app.likedSongs.map((t) => t.id)).toEqual([3]);
  await act(async () => screen!.auth.signOut());
  expect(screen.app.likedSongs.map((t) => t.id)).toEqual([1]);
});
it("keeps one audio element, toggles the same track, seeks, and skips missing previews", async () => {
  screen = await mount();
  const first = sampleTrack(1),
    unavailable = sampleTrack(2, ""),
    third = sampleTrack(3);
  await act(async () => {
    screen!.app.setQueue([first, unavailable, third]);
    screen!.app.playTrack(first);
  });
  const audio = MockAudio.instances[0];
  expect(MockAudio.instances.length).toBe(1);
  expect(audio.src).toBe(first.preview);
  expect(screen.app.isPlaying).toBe(true);
  await act(async () => screen!.app.playTrack(first));
  expect(screen.app.isPlaying).toBe(false);
  await act(async () => screen!.app.playTrack(first));
  expect(screen.app.isPlaying).toBe(true);
  await act(async () => screen!.app.seekTrack(12));
  expect(audio.currentTime).toBe(12);
  expect(screen.app.elapsed).toBe(12);
  await act(async () => screen!.app.playNext());
  expect(screen.app.activeTrack!.id).toBe(3);
  await act(async () => screen!.app.playPrevious());
  expect(screen.app.activeTrack!.id).toBe(1);
  await act(async () => screen!.app.playTrack(unavailable));
  expect(screen.app.activeTrack!.id).toBe(1);
});
it("renders disabled preview controls with a specific tooltip", async () => {
  screen = await mount(
    createElement(TrackList, { tracks: [sampleTrack(2, "")] }),
  );
  const control = screen.host.querySelector<HTMLButtonElement>(
    '[aria-label="No preview available for Test song 2"]',
  )!;
  expect(control.disabled).toBe(true);
  expect(control.title).toBe("No preview available");
});
it("clearing the session stops playback and removes mood data without losing likes", async () => {
  screen = await mount();
  await act(async () => {
    screen!.app.likeTrack(sampleTrack(1));
    screen!.app.setLastQuery({
      mood: "Peaceful",
      mode: "feel",
      rawText: "quiet night",
    });
    screen!.app.playTrack(sampleTrack(1));
  });
  await act(async () => screen!.app.resetSession());
  expect(screen.app.activeTrack).toBeNull();
  expect(screen.app.isPlaying).toBe(false);
  expect(screen.app.lastQuery).toBeNull();
  expect(localStorage.getItem("deezire_last_query")).toBeNull();
  expect(screen.app.likedSongs).toHaveLength(1);
});
