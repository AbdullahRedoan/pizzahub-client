"use client";

import {
  ClipboardCheck,
  Receipt,
  ShieldAlert,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api-client";

type AdminOverviewViewProps = {
  email: string;
};

type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalMenuItems: number;
  pendingMenuItems: number;
  totalTransactions: number;
  totalRevenue: number;
};

type StatsState = {
  key: string;
  stats: AdminStats | null;
  error: string;
};

export function AdminOverviewView({ email }: AdminOverviewViewProps) {
  const [state, setState] = useState<StatsState | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const key = `${email}:${reloadToken}`;
  const isLoading = state?.key !== key;
  const stats = state?.key === key ? state.stats : null;
  const error = state?.key === key ? state.error : "";

  useEffect(() => {
    if (!email) return;

    const controller = new AbortController();
    let active = true;

    apiFetch<{ stats: AdminStats }>("/api/admin/overview", {
      email,
      signal: controller.signal,
    })
      .then((data) => {
        if (active) setState({ key, stats: data.stats, error: "" });
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }
        setState({
          key,
          stats: null,
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "We could not load the platform overview.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [email, key]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 font-sans">
        <div className="h-32 rounded-3xl border border-border bg-card p-6" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-3xl border border-border bg-card p-5"
            >
              <div className="h-4 w-24 rounded-full bg-foreground/10" />
              <div className="mt-5 h-9 w-16 rounded-full bg-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
        <p className="font-script text-2xl text-accent">A little kitchen trouble</p>
        <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
          We could not load the platform overview
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
          {error || "Please try again in a moment."}
        </p>
        <button
          type="button"
          onClick={() => setReloadToken((token) => token + 1)}
          className="mt-6 rounded-full border border-border px-5 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent"
        >
          Try Again
        </button>
      </div>
    );
  }

  const cards: Array<{
    label: string;
    value: string | number;
    icon: LucideIcon;
    note?: string;
  }> = [
    { label: "Total Registered Users", value: stats.totalUsers, icon: Users },
    {
      label: "Vendors vs Customers",
      value: `${stats.totalVendors} / ${stats.totalCustomers}`,
      icon: ShieldAlert,
      note: "vendors / customers",
    },
    {
      label: "Total Menu Items",
      value: stats.totalMenuItems,
      icon: UtensilsCrossed,
    },
    {
      label: "Pending Menu Items",
      value: stats.pendingMenuItems,
      icon: ClipboardCheck,
    },
    {
      label: "Total Transactions",
      value: stats.totalTransactions,
      icon: Receipt,
      note: `Revenue: $${stats.totalRevenue.toFixed(2)}`,
    },
  ];

  const shortcutClass =
    "inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent";

  const shortcut = (href: string, label: string, icon: ReactNode) => (
    <Link key={href} href={href} className={shortcutClass}>
      {icon}
      {label}
    </Link>
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">The whole pizzeria</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Admin Overview
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          A bird&apos;s-eye view of the people, menus, and payments across
          PizzaHub.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {shortcut(
            "/dashboard/admin/users",
            "Moderate Users",
            <Users className="h-4 w-4" />,
          )}
          {shortcut(
            "/dashboard/admin/menu-items",
            "Review Menu Items",
            <ClipboardCheck className="h-4 w-4" />,
          )}
          {shortcut(
            "/dashboard/admin/transactions",
            "View Transactions",
            <Receipt className="h-4 w-4" />,
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
                  {card.label}
                </p>
                <Icon className="h-4 w-4 shrink-0 text-accent" />
              </div>
              <p className="mt-4 font-serif text-3xl font-bold italic text-foreground">
                {card.value}
              </p>
              {card.note ? (
                <p className="mt-1 text-xs text-foreground/60">{card.note}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
