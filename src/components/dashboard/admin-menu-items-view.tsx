"use client";

import { Ban, Check, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MenuImage } from "@/components/menu/menu-image";
import { useApiList } from "@/hooks/use-api-list";
import { apiFetch, type MenuItem } from "@/lib/api-client";

type AdminMenuItemsViewProps = {
  email: string;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "inactive";

const FILTERS: StatusFilter[] = ["all", "pending", "approved", "rejected", "inactive"];

function approvalClass(status: MenuItem["status"]) {
  switch (status) {
    case "approved":
      return "border-primary bg-primary text-primary-foreground";
    case "pending":
      return "border-accent bg-accent text-accent-foreground";
    case "inactive":
      return "border-border bg-foreground/10 text-foreground/70";
    default:
      return "border-border text-foreground/60";
  }
}

export function AdminMenuItemsView({ email }: AdminMenuItemsViewProps) {
  const { items, isLoading, error, setItems } = useApiList<MenuItem>(
    email,
    "/api/admin/menu-items",
    "items",
  );
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleStatus(
    item: MenuItem,
    status: "approved" | "rejected" | "inactive",
  ) {
    if (busyId) return;
    setBusyId(item._id);

    try {
      const data = await apiFetch<{ item: MenuItem }>(
        `/api/admin/menu-items/${item._id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
          email,
        },
      );
      setItems(
        items.map((entry) =>
          entry._id === data.item._id ? data.item : entry,
        ),
      );
      const statusMessage =
        status === "approved"
          ? "Menu item approved"
          : status === "rejected"
            ? "Menu item rejected"
            : "Menu item marked inactive";
      toast.success(statusMessage);
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "We could not update this item.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item: MenuItem) {
    if (busyId) return;
    setBusyId(item._id);

    try {
      const data = await apiFetch<{ message: string }>(
        `/api/admin/menu-items/${item._id}`,
        { method: "DELETE", email },
      );
      setItems(items.filter((entry) => entry._id !== item._id));
      setDeleteId(null);
      toast.success(data.message || "Menu item deleted");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "We could not delete this item.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const visibleItems =
    filter === "all"
      ? items
      : items.filter((item) => item.status === filter);

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="font-script text-2xl text-accent">Quality control</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          Manage Menu Items
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Approve new creations, send them back for a revision, or remove them
          from the catalog.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-3xl border border-border bg-card p-4">
        {FILTERS.map((option) => {
          const active = filter === option;
          const count =
            option === "all"
              ? items.length
              : items.filter((item) => item.status === option).length;

          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground/70 hover:text-accent"
              }`}
            >
              {option}
              <span className="opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-3xl border border-border bg-card p-5"
            >
              <div className="h-5 w-1/3 rounded-full bg-foreground/10" />
              <div className="mt-5 h-3 w-2/3 rounded-full bg-foreground/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="font-script text-2xl text-accent">A little kitchen trouble</p>
          <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
            We could not load the menu items
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
            {error}
          </p>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="font-script text-2xl text-accent">Nothing to review</p>
          <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
            No menu items match this filter
          </h2>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleItems.map((item) => (
            <article
              key={item._id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-border">
                  <MenuImage
                    src={item.images?.[0]}
                    alt={item.itemName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-xl font-bold italic text-foreground">
                        {item.itemName}
                      </h2>
                      <p className="mt-1 text-xs text-foreground/60">
                        {item.vendorName} · {item.category}
                      </p>
                    </div>
                    <p className="font-serif text-lg font-bold italic text-primary">
                      <span className="text-sm">৳</span> {item.price}
                    </p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${approvalClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/60">
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => void handleStatus(item, "approved")}
                  disabled={busyId === item._id || item.status === "approved"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatus(item, "rejected")}
                  disabled={busyId === item._id || item.status === "rejected"}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatus(item, "inactive")}
                  disabled={busyId === item._id || item.status === "inactive"}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Ban className="h-3 w-3" />
                  Inactive
                </button>

                {deleteId === item._id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      disabled={busyId === item._id}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(null)}
                      className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
                    >
                      Keep Item
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteId(item._id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground/70 transition-colors hover:text-accent"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
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
