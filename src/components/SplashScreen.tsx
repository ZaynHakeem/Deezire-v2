import { useEffect } from "react";
import { motion } from "motion/react";
import { CustomLogo } from "./CustomLogo";

export function SplashScreen({
  onFinish,
  minDurationMs = 950,
}: {
  onFinish: () => void;
  minDurationMs?: number;
}) {
  const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")
    .matches;
  useEffect(() => {
    if (reduced || !window.matchMedia?.("(max-width: 767px)").matches) {
      onFinish();
      return;
    }
    const timer = setTimeout(onFinish, minDurationMs);
    return () => clearTimeout(timer);
  }, [reduced, onFinish, minDurationMs]);
  // No model preload here. Opening the app should never start a large download.
  return (
    <motion.div
      className="splash-screen"
      role="status"
      aria-label="Opening Deezire"
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
    >
      <div className="splash-orbit" aria-hidden="true" />
      <CustomLogo size={72} animate={!reduced} />
      <span className="splash-wordmark">deezire.</span>
      <p>Make room for a feeling.</p>
      <span className="eyebrow splash-foot">YOUR MOOD. YOUR MUSIC.</span>
    </motion.div>
  );
}
export default SplashScreen;
