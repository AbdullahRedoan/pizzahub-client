"use client";

import {
  CalendarDays,
  MapPin,
  MessageSquare,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useCustomerOrders } from "@/hooks/use-customer-orders";
import { apiFetch, type OrderRecord } from "@/lib/api-client";

type CustomerOrdersViewProps = {
  email: string;
};

function formatDeliveryDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

function formatCreatedAt(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function statusClass(status: OrderRecord["status"]) {
  switch (status) {
    case "pending":
      return "border-accent/20 bg-accent text-accent-foreground";
    case "accepted":
      return "border-primary bg-primary text-primary-foreground";
    case "rejected":
      return "border-border text-foreground/70";
    case "cancelled":
      return "border-border text-foreground/50";
    default:
      return "border-border text-foreground/70";
  }
}

export function CustomerOrdersView({ email }: CustomerOrdersViewProps) {
  const { orders, isLoading, error, refresh } = useCustomerOrders(email);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  async function handleCancel(order: OrderRecord) {
    if (cancelingId) return;
    setCancelingId(order._id);

    try {
      await apiFetch<{ order: OrderRecord }>(
        `/api/customer/orders/${order._id}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          email,
        },
      );
      toast.success("Order cancelled");
      refresh();
    } catch (cancelError) {
      toast.error(
        cancelError instanceof Error
          ? cancelError.message
          : "We could not cancel this order.",
      );
    } finally {
      setCancelingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-48 rounded-3xl border border-border bg-card p-6"
          >
            <div className="h-5 w-1/3 rounded-full bg-foreground/10" />
            <div className="mt-5 h-3 w-2/3 rounded-full bg-foreground/10" />
            <div className="mt-3 h-3 w-1/2 rounded-full bg-foreground/10" />
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

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">Your order book</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          My Orders
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Every pie you have requested, from first spark to final status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <ShoppingBag className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-3 font-script text-2xl text-accent">Nothing on the tray</p>
          <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
            You have not placed an order yet
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
            Browse the menu and reserve a wood-fired favorite from a local
            kitchen.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order._id}
              className="rounded-3xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl font-bold italic text-foreground sm:text-2xl">
                    {order.itemName}
                  </h2>
                  <p className="mt-1 text-sm text-foreground/70">
                    by {order.vendorName || "PizzaHub kitchen"}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusClass(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground/60">
                      Delivery Date
                    </p>
                    <p className="text-foreground">
                      {formatDeliveryDate(order.deliveryDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground/60">
                      Delivery Address
                    </p>
                    <p className="text-foreground">{order.deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground/60">
                      Additional Message
                    </p>
                    <p className="text-foreground">
                      {order.message || "No extra notes"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground/60">
                      Ordered On
                    </p>
                    <p className="text-foreground">
                      {formatCreatedAt(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <p className="font-serif text-xl font-bold italic text-primary">
                  <span className="text-sm">৳</span> {order.itemPrice}
                </p>
                {order.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => void handleCancel(order)}
                    disabled={cancelingId === order._id}
                    className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {cancelingId === order._id
                      ? "Cancelling…"
                      : "Cancel Order"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
