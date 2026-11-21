import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl my-16 space-y-4 rounded-3xl border border-border bg-card p-10 text-center font-sans">
      <p className="font-script text-3xl text-accent">404 • Hearth Error</p>
      <h1 className="font-serif text-4xl font-semibold italic text-foreground">
        This Slice Is Out of the Oven
      </h1>
      <p className="text-sm leading-relaxed text-foreground/70">
        The page you were looking for has moved, been served, or never made it
        out of the kitchen.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to PizzaHub
      </Link>
    </div>
  );
}
