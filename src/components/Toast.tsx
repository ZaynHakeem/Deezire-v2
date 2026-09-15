import { AnimatePresence, motion } from "motion/react";
import { Info, RotateCcw, X } from "lucide-react";
import { useApp } from "../context/AppContext";
export function Toast() {
  const { toast, undoUnlike, clearToast } = useApp();
  return (
    <div
      className="toast-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toast?.visible && (
          <motion.div
            key={toast.key}
            className="toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Info size={20} />
            <p>{toast.message}</p>
            {toast.actionType === "unlike" && (
              <button className="text-button" onClick={undoUnlike}>
                <RotateCcw size={16} />
                Undo
              </button>
            )}
            <button
              className="icon-button"
              onClick={clearToast}
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
