import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowUpRight, X } from "lucide-react";
import { clickedBackdrop, useDialog } from "../hooks/useDialog";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
}
const ConfirmContext = createContext<
  (options: ConfirmOptions) => Promise<boolean>
>(() => Promise.resolve(false));
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((result: boolean) => void) | null>(null);
  const dialog = useDialog(!!options);
  const confirm = useCallback((next: ConfirmOptions) => {
    if (resolver.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOptions(next);
    });
  }, []);
  const finish = (result: boolean) => {
    dialog.current?.close();
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  };
  useEffect(
    () => () => {
      resolver.current?.(false);
    },
    [],
  );
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <dialog
          ref={dialog}
          className="confirm-dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-description"
          onCancel={(e) => {
            e.preventDefault();
            finish(false);
          }}
          onClick={(e) => {
            if (clickedBackdrop(e)) finish(false);
          }}
        >
          <button
            className="icon-button dialog-close"
            onClick={() => finish(false)}
            aria-label="Close confirmation"
          >
            <X size={20} />
          </button>
          <span className="eyebrow">A quick check</span>
          <h2 id="confirm-title">{options.title}</h2>
          <p id="confirm-description">{options.description}</p>
          <div className="dialog-actions">
            <button
              autoFocus
              className="button secondary"
              onClick={() => finish(false)}
            >
              {options.cancelLabel || "Cancel"}
            </button>
            <button className="button primary" onClick={() => finish(true)}>
              {options.confirmLabel}
              <ArrowUpRight size={17} />
            </button>
          </div>
        </dialog>
      )}
    </ConfirmContext.Provider>
  );
}
export const useConfirm = () => useContext(ConfirmContext);
