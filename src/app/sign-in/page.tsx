"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthAmbientBackdrop } from "@/components/auth/auth-ambient-backdrop";
import { useAuthSession } from "@/context/auth-context";
import { authClient } from "@/lib/auth-client";
import { getDashboardRouteByRole } from "@/lib/role-redirect";

type SocialProvider = "google" | "facebook";

const SOCIAL_LABEL: Record<SocialProvider, string> = {
  google: "Google",
  facebook: "Facebook",
};

export default function SignInPage() {
  const router = useRouter();
  const { user, isPending, refetch } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
    null,
  );

  useEffect(() => {
    if (!isPending && user) {
      router.replace(getDashboardRouteByRole(user.role));
    }
  }, [isPending, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const { data, error } = await authClient.signIn.email({ email, password });

      if (error) {
        toast.error(error.message || "Invalid email or password");
        return;
      }

      await refetch();
      toast.success("Welcome back to PizzaHub!");
      router.push(
        getDashboardRouteByRole((data?.user as { role?: string } | undefined)?.role),
      );
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocial(provider: SocialProvider) {
    if (socialLoading || submitting) return;

    setSocialLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || `Could not continue with ${SOCIAL_LABEL[provider]}`);
      }
    } catch {
      toast.error(`Could not continue with ${SOCIAL_LABEL[provider]}`);
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center overflow-hidden px-4 py-12">
      <AuthAmbientBackdrop />
      <div className="relative z-10 w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="space-y-2 text-center">
          <Link
            href="/"
            className="font-serif text-2xl font-bold italic tracking-tight text-foreground"
          >
            PizzaHub
          </Link>
          <p className="font-script text-2xl text-accent">
            Welcome Back to the Hearth
          </p>
          <h1 className="font-serif text-3xl font-semibold italic text-foreground sm:text-4xl">
            Sign In to PizzaHub
          </h1>
          <p className="font-sans text-sm text-foreground/70">
            Your next wood-fired favorite is just a sign in away.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="space-y-1.5">
            <label
              htmlFor="sign-in-email"
              className="block text-xs font-medium uppercase tracking-wide text-foreground/70"
            >
              Email Address
            </label>
            <input
              id="sign-in-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sign-in-password"
              className="block text-xs font-medium uppercase tracking-wide text-foreground/70"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="sign-in-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                className="w-full rounded-full border border-border bg-background py-3 pl-5 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:text-accent"
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="flex items-center gap-3 font-sans text-xs uppercase tracking-wide text-foreground/60">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3 font-sans">
          <button
            type="button"
            disabled={socialLoading !== null || submitting}
            onClick={() => handleSocial("google")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border font-serif text-xs font-bold text-accent">
              G
            </span>
            {socialLoading === "google" ? "Connecting..." : "Continue with Google"}
          </button>
          <button
            type="button"
            disabled={socialLoading !== null || submitting}
            onClick={() => handleSocial("facebook")}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border font-serif text-xs font-bold text-accent">
              f
            </span>
            {socialLoading === "facebook"
              ? "Connecting..."
              : "Continue with Facebook"}
          </button>
        </div>

        <p className="text-center font-sans text-sm text-foreground/70">
          New to PizzaHub?{" "}
          <Link href="/sign-up" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
