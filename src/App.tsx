import { useState, useCallback, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "motion/react";
import { AppProvider, useApp } from "./context/AppContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { Navigation } from "./components/Navigation";
import { Toast } from "./components/Toast";
import { SplashScreen } from "./components/SplashScreen";
import { Home } from "./pages/Home";
import { LikedSongs } from "./pages/LikedSongs";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import { PlayerBar } from "./components/PlayerBar";

const SPLASH_SEEN_KEY = "deezire_splash_shown";
function RouteFocus() {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Music for your mood",
      "/liked": "Liked songs",
      "/about": "About",
      "/login": "Log in",
      "/signup": "Sign up",
    };
    document.title = `${titles[pathname] || "Page not found"} — Deezire`;
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target instanceof HTMLDetailsElement) target.open = true;
      target?.scrollIntoView();
    } else if (previousPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      document
        .querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
    }
    previousPath.current = pathname;
  }, [pathname, hash]);
  return null;
}
function AppLayout() {
  const { activeTrack } = useApp();
  const [showSplash, setShowSplash] = useState(() => {
    if (
      !window.matchMedia?.("(max-width: 767px)").matches ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return false;
    try {
      return sessionStorage.getItem(SPLASH_SEEN_KEY) === null;
    } catch {
      return true;
    }
  });
  const finishSplash = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
    } catch {
      /* A blocked session store must not block listening. */
    }
    setShowSplash(false);
  }, []);
  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={finishSplash} />}
      </AnimatePresence>
      <div
        inert={showSplash}
        className={`app-layout ${activeTrack ? "has-player" : ""}`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/liked" element={<LikedSongs />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Auth key="login" mode="login" />} />
            <Route
              path="/signup"
              element={<Auth key="signup" mode="signup" />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <RouteFocus />
        <PlayerBar />
        <Toast />
      </div>
    </>
  );
}
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <BrowserRouter>
          <ConfirmProvider>
            <AppLayout />
          </ConfirmProvider>
        </BrowserRouter>
      </AppProvider>
    </MotionConfig>
  );
}
