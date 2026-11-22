"use client";

import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

type VendorSubscriptionViewProps = {
  email: string;
  subscriptionPlan: string;
  subscriptionExpiresAt?: string | null;
};

const FREE_FEATURES = [
  "Up to 3 active menu items",
  "Standard catalog placement",
  "Core vendor dashboard tools",
];

const PREMIUM_FEATURES = [
  "Unlimited active menu items",
  "Premium badge on your kitchen",
  "Featured on the homepage",
  "Top priority in the catalog",
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function VendorSubscriptionView({
  email,
  subscriptionPlan,
  subscriptionExpiresAt,
}: VendorSubscriptionViewProps) {
  const [upgrading, setUpgrading] = useState(false);
  const isPremium = subscriptionPlan.toLowerCase() === "premium";
  const fallbackEndDate = new Date();
  fallbackEndDate.setMonth(fallbackEndDate.getMonth() + 1);
  const subscriptionEndDate = isPremium
    ? formatDate(
        subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : fallbackEndDate,
      )
    : null;

  async function handleUpgrade() {
    if (upgrading) return;
    setUpgrading(true);

    try {
      const data = await apiFetch<{ url: string; sessionId: string }>(
        "/api/stripe/create-checkout-session",
        { method: "POST", email },
      );

      if (!data.url) {
        throw new Error("The checkout session did not include a redirect URL.");
      }

      window.location.href = data.url;
    } catch (upgradeError) {
      toast.error(
        upgradeError instanceof Error
          ? upgradeError.message
          : "We could not start the checkout session.",
      );
    } finally {
      setUpgrading(false);
    }
  }

  const pillClass =
    "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">Choose your table</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Subscription
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          Pick the plan that fits your kitchen today. You can move up any time.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-foreground/70">
            Current plan:{" "}
            <span className="font-semibold capitalize text-foreground">
              {isPremium ? "Premium" : "Free"}
            </span>
          </span>
          {isPremium ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
              <Sparkles className="h-3 w-3" />
              Premium Active
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-script text-2xl text-accent">Simple start</p>
              <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
                Free Plan
              </h2>
            </div>
            {!isPremium ? (
              <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/70">
                Current Plan
              </span>
            ) : null}
          </div>

          <p className="mt-5 font-serif text-4xl font-bold italic text-foreground">
            $0
            <span className="ml-1 font-sans text-sm font-normal not-italic text-foreground/60">
              forever
            </span>
          </p>

          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-script text-2xl text-accent">The full table</p>
              <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
                Premium Plan
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="h-3 w-3" />
              Premium
            </span>
          </div>

          <p className="mt-5 font-serif text-4xl font-bold italic text-foreground">
            $29
            <span className="ml-1 font-sans text-sm font-normal not-italic text-foreground/60">
              /month
            </span>
          </p>
          <p className="mt-2 text-xs text-foreground/60">
            {isPremium && subscriptionEndDate
              ? `Subscription ends on ${subscriptionEndDate}`
              : "Billed monthly. Cancel anytime."}
          </p>

          <ul className="mt-6 space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>

          {!isPremium ? (
            <button
              type="button"
              onClick={() => void handleUpgrade()}
              disabled={upgrading}
              className={`mt-7 ${pillClass}`}
            >
              <Sparkles className="h-4 w-4" />
              {upgrading ? "Opening checkout…" : "Upgrade to Premium"}
            </button>
          ) : (
            <div className="mt-7 space-y-1">
              <p className="text-sm text-foreground/70">
                Your Premium plan is active. Enjoy the prime placement!
              </p>
              <p className="text-sm font-medium text-foreground">
                Your subscription will end on: {subscriptionEndDate}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
