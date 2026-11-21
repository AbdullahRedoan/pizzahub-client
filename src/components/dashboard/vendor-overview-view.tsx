"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useApiList } from "@/hooks/use-api-list";
import type { MenuItem, OrderRecord } from "@/lib/api-client";

type VendorOverviewViewProps = {
  email: string;
  subscriptionPlan: string;
};

const ORDER_STATUSES: OrderRecord["status"][] = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
];

const STATUS_BAR_CLASS: Record<OrderRecord["status"], string> = {
  pending: "bg-accent",
  accepted: "bg-primary",
  rejected: "bg-foreground/40",
  cancelled: "bg-foreground/20",
};

export function VendorOverviewView({
  email,
  subscriptionPlan,
}: VendorOverviewViewProps) {
  const {
    items,
    isLoading: itemsLoading,
    error: itemsError,
  } = useApiList<MenuItem>(email, "/api/vendor/menu-items", "items");
  const {
    items: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useApiList<OrderRecord>(email, "/api/vendor/orders", "orders");

  if (itemsLoading || ordersLoading) {
    return (
      <div className="animate-pulse space-y-6 font-sans">
        <div className="h-32 rounded-3xl border border-border bg-card p-6" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-3xl border border-border bg-card p-5"
            >
              <div className="h-4 w-24 rounded-full bg-foreground/10" />
              <div className="mt-5 h-9 w-16 rounded-full bg-foreground/10" />
            </div>
          ))}
        </div>
        <div className="h-56 rounded-3xl border border-border bg-card p-6" />
      </div>
    );
  }

  if (itemsError || ordersError) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
        <p className="font-script text-2xl text-accent">A little kitchen trouble</p>
        <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
          We could not load your kitchen overview
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
          {itemsError || ordersError}
        </p>
      </div>
    );
  }

  const isPremium = subscriptionPlan.toLowerCase() === "premium";
  const stats: Array<{
    label: string;
    value: string | number;
    icon: LucideIcon;
  }> = [
    { label: "Total Menu Items", value: items.length, icon: UtensilsCrossed },
    {
      label: "Active Items",
      value: items.filter((item) => item.active).length,
      icon: CheckCircle2,
    },
    {
      label: "Pending Orders",
      value: orders.filter((order) => order.status === "pending").length,
      icon: Clock3,
    },
    {
      label: "Accepted Orders",
      value: orders.filter((order) => order.status === "accepted").length,
      icon: ShoppingBag,
    },
    { label: "Subscription Plan", value: isPremium ? "Premium" : "Free", icon: Sparkles },
  ];

  const statusCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
  const maxCount = Math.max(1, ...statusCounts.map((entry) => entry.count));

  const pillClass =
    "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">From your kitchen</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Vendor Overview
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          A fresh look at your menu, your orders, and the plan powering your
          kitchen.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/dashboard/vendor/add-item" className={pillClass}>
            <PlusCircle className="h-4 w-4" />
            Add Menu Item
          </Link>
          <Link href="/dashboard/vendor/subscription" className={pillClass}>
            <Sparkles className="h-4 w-4" />
            Upgrade Subscription
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 shrink-0 text-accent" />
              </div>
              <p className="mt-4 font-serif text-3xl font-bold italic text-foreground">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-script text-2xl text-accent">The order book</p>
            <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
              Order Status Summary
            </h2>
          </div>
          <p className="text-xs uppercase tracking-wide text-foreground/60">
            {orders.length} total orders
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {statusCounts.map(({ status, count }) => (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-foreground/70">{status}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
                <div
                  className={`h-full rounded-full ${STATUS_BAR_CLASS[status]}`}
                  style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-foreground/60">
            No orders have come in yet. Your status bars will fill as customers
            place orders.
          </p>
        ) : (
          <Link
            href="/dashboard/vendor/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent"
          >
            Review all orders
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
