import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Compass, Heart, Info, LogOut, UserRound, Loader2 } from "lucide-react";
import { CustomLogo } from "./CustomLogo";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useConfirm } from "../context/ConfirmContext";

const items = [
  { to: "/", label: "Discover", icon: Compass },
  { to: "/liked", label: "Liked songs", icon: Heart },
  { to: "/about", label: "About", icon: Info },
];
export function Navigation() {
  const { session, signOut, authLoading } = useAuth();
  const { likedSongs, triggerToast, resetSession } = useApp();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    if (signingOut) return;
    if (
      !(await confirm({
        title: "Sign out for now?",
        description:
          "Your liked songs will stay with this account in this browser. You can keep listening as a guest.",
        confirmLabel: "Sign out",
        cancelLabel: "Stay signed in",
      }))
    )
      return;
    setSigningOut(true);
    try {
      await signOut();
      triggerToast("Signed out. Your guest collection is ready.");
      navigate("/");
    } catch (error) {
      triggerToast(
        error instanceof Error
          ? error.message
          : "Could not sign out. Please try again.",
      );
    } finally {
      setSigningOut(false);
    }
  };
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link
            className="brand"
            to="/"
            aria-label="Deezire home"
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              resetSession();
            }}
          >
            <CustomLogo size={36} />
            <span>
              deezire<span className="brand-period">.</span>
            </span>
          </Link>
          <nav
            className="desktop-navigation"
            aria-label="Main navigation"
            aria-live="polite"
          >
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} />
                {label}
                {to === "/liked" && (
                  <span
                    className="nav-count"
                    style={{
                      visibility: likedSongs.length ? "visible" : "hidden",
                    }}
                  >
                    {likedSongs.length > 99 ? "99+" : likedSongs.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="account-navigation" aria-busy={authLoading}>
            {session ? (
              <>
                <span
                  className="account-avatar"
                  title={session.user.email}
                  aria-label={`Signed in as ${session.user.email}`}
                >
                  {session.user.email.charAt(0).toUpperCase()}
                </span>
                <button
                  className="text-button"
                  disabled={signingOut}
                  onClick={handleSignOut}
                >
                  {signingOut ? (
                    <Loader2 size={17} className="spin" />
                  ) : (
                    <LogOut size={16} />
                  )}
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  Log in
                </Link>
                <Link to="/signup" className="button small signup-link">
                  Sign up
                  <Arrow />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <nav
        className="mobile-navigation"
        aria-label="Mobile navigation"
        aria-live="polite"
      >
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
        {!session && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? "active" : ""}`
            }
          >
            <UserRound size={21} />
            <span>Log in</span>
          </NavLink>
        )}
      </nav>
    </>
  );
}
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export default Navigation;
