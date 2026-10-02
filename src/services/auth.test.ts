// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  signUp,
  signIn,
  signOut,
  getSession,
  validateCredentials,
  LOCAL_AUTH_KEY,
} from "./auth";
import { likedSongsKey, readAccountLikes } from "../utils/accountStorage";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
const credentials = {
  email: "listener@example.test",
  password: "Demo-pass1!",
};
describe("local auth provider", () => {
  it("validates email and minimum password length with field-specific messages", () => {
    expect(
      validateCredentials({ email: "broken", password: "123" }, true),
    ).toEqual({
      email: expect.stringContaining("valid email"),
      password: expect.stringContaining("8 to 20"),
    });
    expect(
      validateCredentials(
        { email: credentials.email, password: "        " },
        true,
      ).password,
    ).toContain("only spaces");
    expect(
      validateCredentials(
        { email: credentials.email, password: "alllowercase1!" },
        true,
      ).password,
    ).toContain("uppercase");
    expect(
      validateCredentials(
        { email: credentials.email, password: "NoSymbol1A" },
        true,
      ).password,
    ).toContain("symbol");
    expect(
      validateCredentials(
        { email: credentials.email, password: "WayTooLongPassword12!" },
        true,
      ).password,
    ).toContain("8 to 20");
  });
  it("normalizes email, persists the session, and signs in again after sign-out", async () => {
    const created = await signUp({
      ...credentials,
      email: "  LISTENER@example.test  ",
    });
    expect(created.user.email).toBe(credentials.email);
    expect(await getSession()).toEqual(created);
    await signOut();
    expect(await getSession()).toBeNull();
    expect(await signIn(credentials)).toEqual(created);
  });
  it("rejects a duplicate email and a wrong password without changing the session", async () => {
    const session = await signUp(credentials);
    await expect(signUp(credentials)).rejects.toThrow("already exists");
    await signOut();
    await expect(
      signIn({ ...credentials, password: "wrong-password" }),
    ).rejects.toThrow("does not match");
    expect(await getSession()).toBeNull();
    expect((await signIn(credentials)).user.id).toBe(session.user.id);
  });
  it("treats malformed account data and orphan sessions as signed out", async () => {
    localStorage.setItem(LOCAL_AUTH_KEY, "{broken");
    expect(await getSession()).toBeNull();
    localStorage.setItem(
      LOCAL_AUTH_KEY,
      JSON.stringify({ accounts: [null], currentUserId: "missing" }),
    );
    expect(await getSession()).toBeNull();
    localStorage.setItem(
      LOCAL_AUTH_KEY,
      JSON.stringify({ accounts: [], currentUserId: "missing" }),
    );
    expect(await getSession()).toBeNull();
  });
  it("reports blocked storage instead of pretending account creation succeeded", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    await expect(signUp(credentials)).rejects.toThrow("could not save");
    expect(await getSession()).toBeNull();
  });
  it("keeps guest and account keys distinct and rejects corrupt liked-song data", () => {
    expect(likedSongsKey()).toBe("deezire_liked_songs");
    expect(likedSongsKey("user-a")).not.toBe(likedSongsKey("user-b"));
    localStorage.setItem(likedSongsKey("user-a"), '[{"id":1}]');
    expect(readAccountLikes(likedSongsKey("user-a"))).toEqual([]);
  });
});
