import { act, createElement, ReactNode } from "react";
import { createRoot, Root } from "react-dom/client";
import { vi } from "vitest";
import { AppProvider, useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { MemoryRouter } from "react-router-dom";
import { Track } from "../types";

export const sampleTrack = (
  id: number,
  preview = `https://example.test/preview-${id}.mp3`,
): Track => ({
  id,
  title: `Test song ${id}`,
  artist: { id, name: `Artist ${id}` },
  album: { id, title: `Album ${id}` },
  duration: 210,
  preview,
});
export class MockAudio extends EventTarget {
  static instances: MockAudio[] = [];
  src = "";
  currentTime = 0;
  duration = 30;
  paused = true;
  constructor() {
    super();
    MockAudio.instances.push(this);
  }
  play = vi.fn(async () => {
    this.paused = false;
    this.dispatchEvent(new Event("play"));
  });
  pause = vi.fn(() => {
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  });
  load = vi.fn();
  removeAttribute(name: string) {
    if (name === "src") this.src = "";
  }
}
export function setupDom() {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  localStorage.clear();
  sessionStorage.clear();
  MockAudio.instances = [];
  vi.stubGlobal("Audio", MockAudio);
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
    this.querySelector<HTMLElement>("[autofocus]")?.focus();
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false;
  };
}
export async function mount(children?: ReactNode, path = "/") {
  const host = document.createElement("div");
  document.body.append(host);
  let app: ReturnType<typeof useApp>;
  let auth: ReturnType<typeof useAuth>;
  const Probe = () => {
    app = useApp();
    auth = useAuth();
    return null;
  };
  let root: Root;
  await act(async () => {
    root = createRoot(host);
    root.render(
      createElement(
        AppProvider,
        null,
        createElement(
          MemoryRouter,
          { initialEntries: [path] },
          createElement(ConfirmProvider, null, createElement(Probe), children),
        ),
      ),
    );
  });
  return {
    host,
    get app() {
      return app!;
    },
    get auth() {
      return auth!;
    },
    async unmount() {
      await act(async () => root!.unmount());
      host.remove();
    },
  };
}
export const click = async (element: Element) => {
  await act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
};
export const button = (host: Element, label: string) => {
  const found = Array.from(host.querySelectorAll("button")).find(
    (b) =>
      b.textContent?.trim() === label || b.getAttribute("aria-label") === label,
  );
  if (!found)
    throw new Error(
      `Button missing: ${label}. Current buttons: ${Array.from(
        host.querySelectorAll("button"),
      )
        .map((b) => b.textContent)
        .join(", ")}`,
    );
  return found;
};
export const inputValue = async (
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) => {
  await act(async () => {
    const prototype =
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(
      element,
      value,
    );
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
};
