"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useAuthSession, type UserRole } from "@/context/auth-context";
import { cn } from "@/lib/utils";

type NavLink = {
  label: string;
  href: string;
};

const BASE_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
];

const DASHBOARD_HREF: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  vendor: "/dashboard/vendor",
  admin: "/dashboard/admin",
};

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function BrandLink({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="PizzaHub home"
      className="flex items-center justify-center gap-2.5"
    >
      <span className="font-serif text-2xl font-bold italic tracking-tight text-foreground sm:text-3xl">
        PizzaHub
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:text-accent"
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthSession();
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const dashboardHref = user ? DASHBOARD_HREF[user.role] : null;
  const links: NavLink[] = dashboardHref
    ? [...BASE_LINKS, { label: "Dashboard", href: dashboardHref }]
    : BASE_LINKS;

  const initials =
    user?.name
      .trim()
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PH";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setDrawerOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleLogout() {
    void Promise.resolve(logout());
    setProfileOpen(false);
    setDrawerOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left flank */}
        <div className="flex items-center justify-start">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav aria-label="Primary navigation" className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative isolate rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary text-primary-foreground"
                      : "border-border text-foreground hover:text-accent",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="pizzahub-nav-pill"
                      className="absolute inset-0 rounded-full border border-primary bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center anchor */}
        <div className="flex items-center justify-center">
          <BrandLink />
        </div>

        {/* Right flank */}
        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm text-foreground"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-accent">
                  {initials}
                </span>
                <span className="hidden max-w-24 truncate sm:inline">
                  {user.name}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full z-50 mt-3 w-64 rounded-3xl border border-border bg-card p-5 shadow-lg"
                  >
                    <p className="font-serif text-xl font-bold italic text-foreground">
                      {user.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-foreground">
                      {user.email}
                    </p>
                    <span className="mt-3 inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-medium capitalize text-accent">
                      {user.role}
                    </span>

                    <div className="mt-4 border-t border-border pt-3">
                      <Link
                        role="menuitem"
                        href={dashboardHref ?? "/dashboard/customer"}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground transition-colors hover:text-accent"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        role="menuitem"
                        href="/profile-settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-foreground transition-colors hover:text-accent"
                      >
                        <Settings className="h-4 w-4" />
                        Profile Settings
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:text-accent"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/sign-in"
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full border border-primary bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile slide-over drawer — portaled to body so the sticky header's
          stacking context and backdrop blur cannot clip it. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setDrawerOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-xs md:hidden"
                />

                <motion.aside
                  aria-label="Mobile navigation"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  className="fixed inset-y-0 left-0 z-50 flex h-dvh w-80 max-w-[85vw] flex-col justify-between overflow-y-auto rounded-r-3xl border-r border-border bg-card p-6 text-foreground md:hidden"
                >
                  <div className="flex items-center justify-between gap-3">
                    <BrandLink onClick={() => setDrawerOpen(false)} />
                    <button
                      type="button"
                      aria-label="Close navigation menu"
                      onClick={() => setDrawerOpen(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <nav
                    aria-label="Mobile primary navigation"
                    className="flex flex-col gap-2 py-6"
                  >
                    {links.map((link) => {
                      const active = isActive(pathname, link.href);

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setDrawerOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative isolate rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                            active
                              ? "border-primary text-primary-foreground"
                              : "border-border text-foreground hover:text-accent",
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="pizzahub-mobile-nav-pill"
                              className="absolute inset-0 rounded-full border border-primary bg-primary"
                              transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            />
                          )}
                          <span className="relative z-10">{link.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="flex flex-col gap-3 border-t border-border pt-6">
                    {user ? (
                      <>
                        <div className="rounded-3xl border border-border bg-background p-4">
                          <p className="font-serif text-lg font-bold italic text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-foreground">
                            {user.email}
                          </p>
                          <span className="mt-2 inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-medium capitalize text-accent">
                            {user.role}
                          </span>
                        </div>
                        <Link
                          href={dashboardHref ?? "/dashboard/customer"}
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile-settings"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground"
                        >
                          <Settings className="h-4 w-4" />
                          Profile Settings
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/sign-in"
                          onClick={() => setDrawerOpen(false)}
                          className="rounded-full border border-border px-4 py-2 text-center text-sm font-medium text-foreground"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/sign-up"
                          onClick={() => setDrawerOpen(false)}
                          className="rounded-full border border-primary bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
}
