import { Flame, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CopyrightYear } from "@/components/layout/copyright-year";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
  { label: "Vendor Plans", href: "/vendor-plans" },
  { label: "Sign Up", href: "/sign-up" },
];

function XLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h0.01" />
    </svg>
  );
}

function FacebookLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                <Flame className="h-4 w-4 text-accent" />
              </span>
              <span className="font-serif text-2xl font-bold italic tracking-tight text-foreground">
                PizzaHub
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Slow-fermented dough, wood-fired crusts and honest ingredients —
              delivered from our oven to your door, warm and on time.
            </p>
            <p className="mt-4 font-script text-2xl text-accent">
              Good pizza, good company.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold italic text-foreground">
              Explore
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold italic text-foreground">
              Get in touch
            </h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a
                  href="mailto:concierge@pizzahub.example"
                  className="text-foreground transition-colors hover:text-accent"
                >
                  concierge@pizzahub.example
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a
                  href="tel:+8801700900410"
                  className="text-foreground transition-colors hover:text-accent"
                >
                  +880 1700-900410
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-foreground">
                  Dhanmondi &amp; Gulshan, Dhaka
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold italic text-foreground">
              Follow the oven
            </h2>
            <p className="mt-5 text-sm">
              Fresh bakes, seasonal specials and stories from our kitchen.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PizzaHub on X"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:text-accent"
              >
                <XLogo />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PizzaHub on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:text-accent"
              >
                <InstagramLogo />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PizzaHub on Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:text-accent"
              >
                <FacebookLogo />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            ©{" "}
            <Suspense fallback={null}>
              <CopyrightYear />
            </Suspense>{" "}
            PizzaHub. All rights reserved.
          </p>
          <p className="font-script text-lg text-accent">
            Baked fresh, delivered with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
