import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export default function AppHeader({
  title,
  subtitle,
  showLogo = false,
}: AppHeaderProps) {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDark]);

  const isLoggedIn = !!identity;
  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 5)}...`
    : "";

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo / Title */}
        <div className="flex items-center gap-2.5">
          {showLogo && (
            <img
              src="/assets/generated/norcet-logo-transparent.dim_200x200.png"
              alt="NORCET Prep"
              className="h-8 w-8 object-contain"
            />
          )}
          <div>
            <h1 className="font-display font-bold text-base text-foreground leading-tight">
              {title ?? "NORCET Prep"}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Auth */}
          {isInitializing ? null : isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground hidden sm:block">
                <User size={12} className="inline mr-1" />
                {principalShort}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                data-ocid="auth.logout_button"
                className="h-8 px-2 text-xs"
              >
                <LogOut size={15} className="mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="auth.login_button"
              className="h-8 px-2 text-xs text-primary"
            >
              <LogIn size={15} className="mr-1" />
              Login
            </Button>
          )}

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            data-ocid="darkmode.toggle"
            aria-label="Toggle dark mode"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}
