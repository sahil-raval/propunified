import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useUser, UserButton } from "@clerk/react";
import { Button } from "./ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/listings", label: "Sell" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/kyc", label: "KYC" },
];

export function Navbar() {
  const { isSignedIn } = useUser();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  // Transparent hero treatment only on the home page before scroll
  const isHomePage = location === "/";
  const isTransparent = isHomePage && !scrolled && !mobileOpen;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* ── Floating glass bar ───────────────────────────────────── */}
      <div
        className={`mx-auto transition-all duration-300 ${
          isTransparent
            ? "max-w-full px-0 py-0"
            : "max-w-full py-0"
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 transition-all duration-300 ${
            isTransparent
              ? "py-5 bg-transparent"
              : "py-3 bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm"
          }`}
        >

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 z-10">
            <span className="font-serif text-xl md:text-2xl tracking-wide whitespace-nowrap select-none">
              <span className="text-primary font-bold">PROP</span>
              <span
                className={`font-light transition-colors ${
                  isTransparent ? "text-white/90" : "text-foreground/90"
                }`}
              >
                {" "}UNIFIED
              </span>
            </span>
          </Link>

          {/* ── Desktop nav — shown at md (768 px) and above ──────── */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap transition-colors hover:text-primary ${
                  location === href
                    ? "text-primary"
                    : isTransparent
                      ? "text-white/80 hover:text-white"
                      : "text-foreground/70"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Desktop actions — shown at md and above ───────────── */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
              className={`p-2 rounded-full transition-all hover:text-primary hover:bg-foreground/5 ${
                isTransparent ? "text-white/70" : "text-foreground/60"
              }`}
            >
              {theme === "dark"
                ? <Sun className="h-[18px] w-[18px]" />
                : <Moon className="h-[18px] w-[18px]" />
              }
            </button>

            {!isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-sm font-medium hover:bg-transparent hover:text-primary px-3 ${
                      isTransparent ? "text-white/80" : "text-foreground/70"
                    }`}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black hover:opacity-90 font-semibold whitespace-nowrap ml-1"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-1">
                <Link
                  href="/profile"
                  className={`text-sm hover:text-primary transition-colors ${
                    isTransparent ? "text-white/80" : "text-foreground/70"
                  }`}
                >
                  Profile
                </Link>
                <UserButton
                  appearance={{
                    elements: { userButtonAvatarBox: "w-8 h-8 border border-primary/20" },
                  }}
                />
              </div>
            )}
          </div>

          {/* ── Mobile / tablet right controls ───────────────────── */}
          <div className="md:hidden flex items-center gap-1 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className={`p-2 rounded-full transition-all hover:text-primary hover:bg-foreground/5 ${
                isTransparent ? "text-white/70" : "text-foreground/60"
              }`}
            >
              {theme === "dark"
                ? <Sun className="h-5 w-5" />
                : <Moon className="h-5 w-5" />
              }
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              className={`p-2 rounded-md transition-colors ${
                isTransparent
                  ? "text-white/80 hover:text-white"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {mobileOpen
                ? <X className="h-5 w-5" />
                : <Menu className="h-5 w-5" />
              }
            </button>
          </div>
        </div>

        {/* ── Mobile / tablet drawer ──────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border/50 shadow-lg">
            <div className="px-6 pt-2 pb-5">
              <nav className="space-y-0.5 mb-4">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center py-3 px-3 rounded-xl text-sm font-medium transition-colors hover:bg-foreground/5 hover:text-primary ${
                      location === href
                        ? "text-primary bg-primary/8"
                        : "text-foreground/70"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-border/50 pt-4 flex gap-3">
                {!isSignedIn ? (
                  <>
                    <Link href="/sign-in" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full border-border">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" className="flex-1">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/profile" className="text-sm text-foreground/70 hover:text-primary">
                      Profile
                    </Link>
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
