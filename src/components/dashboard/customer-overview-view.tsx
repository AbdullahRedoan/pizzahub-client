"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ShoppingBag,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCustomerOrders } from "@/hooks/use-customer-orders";

type CustomerOverviewViewProps = {
  email: string;
};

export function CustomerOverviewView({ email }: CustomerOverviewViewProps) {
  const { orders, isLoading, error } = useCustomerOrders(email);

  if (isLoading) {
    return (
      <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-3xl border border-border bg-card p-5"
          >
            <div className="h-4 w-20 rounded-full bg-foreground/10" />
            <div className="mt-5 h-10 w-16 rounded-full bg-foreground/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
        <p className="font-script text-2xl text-accent">A little kitchen trouble</p>
        <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
          We could not load your orders
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
          {error}
        </p>
      </div>
    );
  }

  const stats: Array<{
    label: string;
    value: number;
    icon: LucideIcon;
  }> = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    {
      label: "Pending",
      value: orders.filter((order) => order.status === "pending").length,
      icon: Clock3,
    },
    {
      label: "Accepted",
      value: orders.filter((order) => order.status === "accepted").length,
      icon: CheckCircle2,
    },
    {
      label: "Rejected",
      value: orders.filter((order) => order.status === "rejected").length,
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">Your table awaits</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Customer Overview
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          A quick look at everything you have ordered from neighborhood
          kitchens.
        </p>
        <Link
          href="/menu"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Browse the menu
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-4 font-serif text-4xl font-bold italic text-foreground">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
