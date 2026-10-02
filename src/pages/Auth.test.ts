// @vitest-environment jsdom
import { act, createElement } from "react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { Auth } from "./Auth";
import { mount, setupDom, button, click, inputValue } from "../test/helpers";

let screen: Awaited<ReturnType<typeof mount>> | undefined;
beforeEach(setupDom);
afterEach(async () => {
  await screen?.unmount();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const submit = async () => {
  await act(async () => {
    screen!.host
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
};
it("labels fields, displays validation messages, focuses the first error, and toggles password visibility", async () => {
  screen = await mount(createElement(Auth, { mode: "signup" }), "/signup");
  const email = screen.host.querySelector<HTMLInputElement>("#auth-email")!;
  const password =
    screen.host.querySelector<HTMLInputElement>("#auth-password")!;
  expect(
    screen.host.querySelector('label[for="auth-email"]')!.textContent,
  ).toBe("Email address");
  await submit();
  expect(document.activeElement).toBe(email);
  expect(screen.host.querySelector("#email-error")!.textContent).toContain(
    "Enter your email",
  );
  await inputValue(email, "new@example.test");
  await inputValue(password, "short");
  await submit();
  expect(document.activeElement).toBe(password);
  expect(screen.host.querySelector("#password-error")!.textContent).toContain(
    "8 to 20",
  );
  await click(button(screen.host, "Show password"));
  expect(password.type).toBe("text");
  await click(button(screen.host, "Hide password"));
  expect(password.type).toBe("password");
  expect(screen.host.querySelector(".guest-link")!.getAttribute("href")).toBe(
    "/",
  );
});
it("creates a local account from the form and returns an actionable inline login error", async () => {
  screen = await mount(createElement(Auth, { mode: "signup" }), "/signup");
  await inputValue(
    screen.host.querySelector("#auth-email")!,
    "new@example.test",
  );
  await inputValue(
    screen.host.querySelector("#auth-password")!,
    "Demo-pass1!",
  );
  await submit();
  expect(screen.auth.session?.user.email).toBe("new@example.test");
  await act(async () => screen!.auth.signOut());
  await screen.unmount();
  screen = await mount(createElement(Auth, { mode: "login" }), "/login");
  await inputValue(
    screen.host.querySelector("#auth-email")!,
    "new@example.test",
  );
  await inputValue(
    screen.host.querySelector("#auth-password")!,
    "wrong-password",
  );
  await submit();
  expect(screen.host.querySelector('[role="alert"]')!.textContent).toContain(
    "does not match",
  );
  expect(screen.auth.session).toBeNull();
});
