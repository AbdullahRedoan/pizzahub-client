"use client";

import { CalendarDays, Mail, MapPin, MessageSquare, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApiList } from "@/hooks/use-api-list";
import { apiFetch, type OrderRecord } from "@/lib/api-client";

type VendorOrdersViewProps = {
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
      return "border-accent bg-accent text-accent-foreground";
    case "accepted":
      return "border-primary bg-primary text-primary-foreground";
    case "rejected":
    case "cancelled":
      return "border-border text-foreground/60";
    default:
      return "border-border text-foreground/70";
  }
}

export function VendorOrdersView({ email }: VendorOrdersViewProps) {
  const { items: orders, isLoading, error, setItems } = useApiList<OrderRecord>(
    email,
    "/api/vendor/orders",
    "orders",
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleStatus(order: OrderRecord, status: "accepted" | "rejected") {
    if (busyId) return;
    setBusyId(order._id);

    try {
      const data = await apiFetch<{ order: OrderRecord }>(
        `/api/vendor/orders/${order._id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
          email,
        },
      );
      setItems(
        orders.map((entry) =>
          entry._id === data.order._id ? data.order : entry,
        ),
      );
      toast.success(
        status === "accepted" ? "Order accepted" : "Order rejected",
      );
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "We could not update this order.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 font-sans">
        <div className="h-28 rounded-3xl border border-border bg-card p-6" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-56 rounded-3xl border border-border bg-card p-6"
          >
            <div className="h-5 w-1/3 rounded-full bg-foreground/10" />
            <div className="mt-5 h-3 w-2/3 rounded-full bg-foreground/10" />
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
          We could not load your customer orders
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
        <p className="font-script text-2xl text-accent">Fresh from the inbox</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Customer Orders
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Accept or reject pending requests. A decision can only be made once.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="font-script text-2xl text-accent">Quiet in the kitchen</p>
          <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
            No customer orders yet
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
            Orders will appear here as soon as customers reserve your items.
          </p>
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
                    <span className="text-sm">৳</span> {order.itemPrice}
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
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground/60">
                      Customer
                    </p>
                    <p className="text-foreground">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground/60">
                      Email
                    </p>
                    <p className="break-all text-foreground">
                      {order.customerEmail}
                    </p>
                  </div>
                </div>
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
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
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

              {order.status === "pending" ? (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => void handleStatus(order, "accepted")}
                    disabled={busyId === order._id}
                    className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleStatus(order, "rejected")}
                    disabled={busyId === order._id}
                    className="rounded-full border border-border px-5 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
