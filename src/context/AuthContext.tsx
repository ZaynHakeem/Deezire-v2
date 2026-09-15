import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as auth from "../services/auth";

interface AuthState {
  session: auth.AuthSession | null;
  authLoading: boolean;
  authError: string | null;
  signIn: (credentials: auth.AuthCredentials) => Promise<void>;
  signUp: (credentials: auth.AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthState | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<auth.AuthSession | null>(null);
  const [authLoading, setLoading] = useState(true);
  const [authError, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const restore = () =>
      auth
        .getSession()
        .then((s) => {
          if (live) {
            setSession(s);
            setError(null);
          }
        })
        .catch(() => {
          if (live)
            setError(
              "Your account could not be restored. You can still listen as a guest.",
            );
        })
        .finally(() => {
          if (live) setLoading(false);
        });
    void restore();
    const onStorage = (event: StorageEvent) => {
      if (event.key === auth.LOCAL_AUTH_KEY || event.key === null)
        void restore();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      live = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{
        session,
        authLoading,
        authError,
        signIn: async (c) => {
          const s = await auth.signIn(c);
          setSession(s);
          setError(null);
        },
        signUp: async (c) => {
          const s = await auth.signUp(c);
          setSession(s);
          setError(null);
        },
        signOut: async () => {
          await auth.signOut();
          setSession(null);
          setError(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
