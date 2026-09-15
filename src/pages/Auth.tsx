import { FormEvent, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Loader2,
  Heart,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { AuthError, isDemoAuth, validateCredentials } from "../services/auth";
import { MoodArtwork } from "../components/MoodArtwork";

export function Auth({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const { signIn, signUp, session, authLoading, authError } = useAuth();
  const { triggerToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef(false);
  if (session) return <Navigate to="/liked" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitRef.current) return;
    const next = validateCredentials({ email, password }, signup);
    setErrors(next);
    setFormError("");
    if (next.email || next.password) {
      (next.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    submitRef.current = true;
    setBusy(true);
    try {
      await (signup ? signUp : signIn)({ email, password });
      triggerToast(
        signup
          ? "Your account is ready. Make this collection yours."
          : "Welcome back. Your liked songs are here.",
      );
    } catch (error) {
      if (error instanceof AuthError && error.field) {
        setErrors({ [error.field]: error.message });
        requestAnimationFrame(() =>
          (error.field === "email" ? emailRef : passwordRef).current?.focus(),
        );
      } else
        setFormError(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        );
    } finally {
      submitRef.current = false;
      setBusy(false);
    }
  };
  const blur = (field: "email" | "password") =>
    setErrors((previous) => ({
      ...previous,
      [field]: validateCredentials({ email, password }, signup)[field],
    }));
  return (
    <div className="page-shell auth-layout">
      <section className="auth-content">
        <Link to="/" className="text-button">
          <ArrowLeft size={16} />
          Back to the music
        </Link>
        <span className="eyebrow">YOUR OWN LITTLE CORNER</span>
        <h1 tabIndex={-1}>
          {signup ? (
            <>
              Good music.
              <br />
              <span className="gradient-text">Keep it close.</span>
            </>
          ) : (
            <>
              Welcome
              <br />
              <span className="gradient-text">back to you.</span>
            </>
          )}
        </h1>
        <p className="lead">
          {signup
            ? "Give your favorite discoveries a place to stay."
            : "Your feelings change. Your favorites are right here."}
        </p>
        {isDemoAuth && (
          <div className="demo-notice">
            <Info size={19} />
            <p>
              <strong>Local demo account</strong>Use a made-up password. Account
              details and likes stay in this browser. No email is sent; nothing
              syncs to other devices.
            </p>
          </div>
        )}
        <form
          onSubmit={submit}
          noValidate
          aria-busy={busy || authLoading}
          className="auth-form"
        >
          <fieldset disabled={busy || authLoading}>
            <div className="form-field">
              <label htmlFor="auth-email">Email address</label>
              <div className={`input-wrap ${errors.email ? "invalid" : ""}`}>
                <Mail size={18} />
                <input
                  ref={emailRef}
                  id="auth-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  onBlur={() => blur("email")}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              <p id="email-error" className="field-error">
                {errors.email || "\u00a0"}
              </p>
            </div>
            <div className="form-field">
              <label htmlFor="auth-password">Password</label>
              <div className={`input-wrap ${errors.password ? "invalid" : ""}`}>
                <LockKeyhole size={18} />
                <input
                  ref={passwordRef}
                  id="auth-password"
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete={signup ? "new-password" : "current-password"}
                  required
                  minLength={signup ? 8 : undefined}
                  placeholder={
                    signup ? "At least 8 characters" : "Your password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  onBlur={() => blur("password")}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : "password-help"
                  }
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                  onClick={() => setVisible((p) => !p)}
                >
                  {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              <p
                className={errors.password ? "field-error" : "field-help"}
                id={errors.password ? "password-error" : "password-help"}
              >
                {errors.password ||
                  (signup
                    ? "8 or more characters. Use a password only for this demo."
                    : "Use the password you created for this account.")}
              </p>
            </div>
            {(formError || authError) && (
              <div className="inline-banner error-banner" role="alert">
                {formError || authError}
              </div>
            )}
            <button className="button primary auth-submit" type="submit">
              {busy || authLoading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  {busy
                    ? signup
                      ? "Creating your account…"
                      : "Logging in…"
                    : "Checking your session…"}
                </>
              ) : (
                <>
                  {signup ? "Create account" : "Log in"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </fieldset>
        </form>
        <p className="auth-switch">
          {signup ? "Already have an account?" : "New around here?"}{" "}
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Create an account"}
          </Link>
        </p>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <Link to="/" className="button secondary guest-link">
          Continue without an account
          <ArrowRight size={17} />
        </Link>
        <p className="auth-privacy">
          {signup
            ? "Your email identifies your local collection. Your password lets you return to it. "
            : ""}
          <Link to="/about#your-data">How your data is used</Link>
        </p>
      </section>
      <aside className="auth-art">
        <MoodArtwork />
        <div className="auth-art-caption">
          <Heart size={20} />
          <p>
            For the songs that
            <br />
            <strong>feel like you.</strong>
          </p>
        </div>
      </aside>
    </div>
  );
}
