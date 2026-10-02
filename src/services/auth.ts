import { safeLocalStorageSet } from "../utils/storageGuards";
import { readLocalStorage } from "../utils/accountStorage";
import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
}
export interface AuthSession {
  user: AuthUser;
}
export interface AuthCredentials {
  email: string;
  password: string;
}
export interface AuthProvider {
  signUp(credentials: AuthCredentials): Promise<AuthSession>;
  signIn(credentials: AuthCredentials): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}
export class AuthError extends Error {
  constructor(
    message: string,
    public field?: "email" | "password",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function validateCredentials(
  { email, password }: AuthCredentials,
  signup = false,
) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = "Enter a valid email, like you@example.com.";
  if (!password) errors.password = "Enter your password.";
  else if (signup) errors.password = signupPasswordError(password);
  return errors;
}

function signupPasswordError(password: string) {
  if (!password.trim()) return "Your password cannot contain only spaces.";
  if (password.length < 8 || password.length > 20)
    return "Use 8 to 20 characters.";
  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9\s]/.test(password)
  )
    return "Include an uppercase letter, a lowercase letter, a number, and a symbol.";
}

export const LOCAL_AUTH_KEY = "deezire_demo_auth_v1";
interface LocalData {
  accounts: { user: AuthUser; demoPassword: string }[];
  currentUserId: string | null;
}
const emptyData = (): LocalData => ({ accounts: [], currentUserId: null });

function isUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const u = value as AuthUser;
  return (
    typeof u.id === "string" &&
    !!u.id &&
    typeof u.email === "string" &&
    !!u.email
  );
}
function readData(): LocalData {
  try {
    const value = JSON.parse(readLocalStorage(LOCAL_AUTH_KEY) || "null");
    if (!value || !Array.isArray(value.accounts)) return emptyData();
    if (
      !value.accounts.every(
        (a: LocalData["accounts"][number]) =>
          a && isUser(a.user) && typeof a.demoPassword === "string",
      )
    )
      return emptyData();
    return {
      accounts: value.accounts,
      currentUserId:
        typeof value.currentUserId === "string" ? value.currentUserId : null,
    };
  } catch {
    return emptyData();
  }
}
function writeData(data: LocalData) {
  if (!safeLocalStorageSet(LOCAL_AUTH_KEY, JSON.stringify(data))) {
    throw new AuthError(
      "Your browser could not save this account. Allow site storage or continue as a guest.",
    );
  }
}
function check(credentials: AuthCredentials, signup: boolean) {
  const errors = validateCredentials(credentials, signup);
  if (errors.email) throw new AuthError(errors.email, "email");
  if (errors.password) throw new AuthError(errors.password, "password");
}

/**
 * DEVELOPMENT STUB ONLY — NOT AUTHENTICATION OR A SECURITY BOUNDARY.
 * Made-up demo passwords are stored as PLAIN TEXT in this browser so the
 * prototype can check a later sign-in. No hashing, encryption, verification,
 * password reset, rate limiting, or secure sessions. Never use real passwords.
 * TODO: replace this provider with Supabase Auth or a server backed by MongoDB.
 * Never move this password-storage implementation into a production backend.
 */
const localProvider: AuthProvider = {
  async signUp(credentials) {
    check(credentials, true);
    const data = readData();
    const email = credentials.email.trim().toLowerCase();
    if (data.accounts.some((a) => a.user.email === email))
      throw new AuthError(
        "An account with this email already exists in this browser. Log in instead.",
        "email",
      );
    const user = { id: crypto.randomUUID(), email };
    writeData({
      accounts: [
        ...data.accounts,
        { user, demoPassword: credentials.password },
      ],
      currentUserId: user.id,
    });
    return { user };
  },
  async signIn(credentials) {
    check(credentials, false);
    const data = readData();
    const account = data.accounts.find(
      (a) => a.user.email === credentials.email.trim().toLowerCase(),
    );
    if (!account || account.demoPassword !== credentials.password)
      throw new AuthError(
        "Email or password does not match. Use the account you created in this browser.",
      );
    writeData({ ...data, currentUserId: account.user.id });
    return { user: account.user };
  },
  async signOut() {
    writeData({ ...readData(), currentUserId: null });
  },
  async getSession() {
    const data = readData();
    const account = data.accounts.find((a) => a.user.id === data.currentUserId);
    return account ? { user: account.user } : null;
  },
};

function accountFromSupabase(user: { id: string; email?: string | null } | null) {
  if (!user?.email) return null;
  return { user: { id: user.id, email: user.email } };
}

function throwSupabase(error: { message: string }): never {
  const message = error.message || "";
  if (/already registered|already exists/i.test(message))
    throw new AuthError(
      "An account with this email already exists. Log in instead.",
      "email",
    );
  if (/invalid login|invalid credentials/i.test(message))
    throw new AuthError("Email or password does not match.");
  throw new AuthError(
    message || "We could not reach your account. Please try again.",
  );
}

const supabaseProvider: AuthProvider = {
  async signUp(credentials) {
    check(credentials, true);
    const { data, error } = await supabase!.auth.signUp({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throwSupabase(error);
    const session = accountFromSupabase(data.user);
    if (!data.session || !session)
      throw new AuthError(
        "Check your email to confirm your account, then log in.",
      );
    return session;
  },
  async signIn(credentials) {
    check(credentials, false);
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
    if (error) throwSupabase(error);
    const session = accountFromSupabase(data.user);
    if (!session) throw new AuthError("Email or password does not match.");
    return session;
  },
  async signOut() {
    const { error } = await supabase!.auth.signOut();
    if (error) throw new AuthError("Could not sign out. Please try again.");
  },
  async getSession() {
    const { data, error } = await supabase!.auth.getSession();
    if (error)
      throw new AuthError(
        "Your account could not be restored. You can still listen as a guest.",
      );
    return accountFromSupabase(data.session?.user ?? null);
  },
};

/**
 * Backend integration seam. Set VITE_AUTH_PROVIDER=api and VITE_AUTH_API_URL
 * after implementing these JSON endpoints. The server owns secure HttpOnly
 * sessions, validation, CSRF protection, and its Supabase/MongoDB integration.
 * TODO: implement the backend and account-liked-song sync before production.
 */
async function apiRequest(
  path: string,
  credentials?: AuthCredentials,
): Promise<AuthSession | null> {
  const base = (import.meta.env.VITE_AUTH_API_URL || "/api/auth").replace(
    /\/$/,
    "",
  );
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${base}/${path}`, {
      method: path === "session" ? "GET" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: credentials ? JSON.stringify(credentials) : undefined,
      signal: controller.signal,
    });
    if (path === "session" && response.status === 401) return null;
    if (!response.ok)
      throw new AuthError(
        response.status === 401
          ? "Email or password does not match."
          : "We could not reach your account. Please try again.",
      );
    if (path === "sign-out") return null;
    const result = await response.json();
    if (!isUser(result?.user))
      throw new AuthError(
        "The account service returned an unexpected response. Please try again.",
      );
    return { user: result.user };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(
      "The account service is unavailable. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }
}
const apiProvider: AuthProvider = {
  signUp: async (c) => (await apiRequest("sign-up", c))!,
  signIn: async (c) => (await apiRequest("sign-in", c))!,
  signOut: async () => {
    await apiRequest("sign-out");
  },
  getSession: () => apiRequest("session"),
};
const provider: AuthProvider = supabase
  ? supabaseProvider
  : import.meta.env.VITE_AUTH_PROVIDER === "api"
    ? apiProvider
    : localProvider;
export const isDemoAuth = provider === localProvider;
export const signUp = (credentials: AuthCredentials) =>
  provider.signUp(credentials);
export const signIn = (credentials: AuthCredentials) =>
  provider.signIn(credentials);
export const signOut = () => provider.signOut();
export const getSession = () => provider.getSession();
