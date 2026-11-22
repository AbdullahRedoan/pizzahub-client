"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MenuImage } from "@/components/menu/menu-image";
import {
  isFreePlan,
  useFreePlanRedirect,
} from "@/hooks/use-free-plan-redirect";
import { useApiList } from "@/hooks/use-api-list";
import {
  apiFetch,
  type MenuItem,
  type MenuItemStatus,
} from "@/lib/api-client";
import { CATEGORY_OPTIONS } from "@/lib/menu-filters";

type VendorMyItemsViewProps = {
  email: string;
  subscriptionPlan: string;
};

const EDITORIAL_CATEGORIES = CATEGORY_OPTIONS.filter(
  (option) => option !== "All Categories",
);

function approvalClass(status: MenuItemStatus) {
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

export function VendorMyItemsView({
  email,
  subscriptionPlan,
}: VendorMyItemsViewProps) {
  const { items, isLoading, error, setItems } = useApiList<MenuItem>(
    email,
    "/api/vendor/menu-items",
    "items",
  );
  const redirectToSubscription = useFreePlanRedirect();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const editing = items.find((item) => item._id === editingId) ?? null;
  const activeCount = items.filter((item) => item.active).length;

  const fieldClass =
    "w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent";

  async function handleToggle(item: MenuItem) {
    if (busyId) return;

    if (!item.active && isFreePlan(subscriptionPlan) && activeCount >= 3) {
      redirectToSubscription();
      return;
    }

    setBusyId(item._id);

    try {
      const data = await apiFetch<{ item: MenuItem }>(
        `/api/vendor/menu-items/${item._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !item.active }),
          email,
        },
      );
      setItems(
        items.map((entry) =>
          entry._id === data.item._id ? data.item : entry,
        ),
      );
      toast.success(data.item.active ? "Menu item activated" : "Menu item deactivated");
    } catch (toggleError) {
      if (redirectToSubscription(toggleError)) return;
      toast.error(
        toggleError instanceof Error
          ? toggleError.message
          : "We could not update this item.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || busyId) return;

    const formData = new FormData(event.currentTarget);
    const payload = {
      itemName: String(formData.get("itemName") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      price: Number(formData.get("price")),
      location: String(formData.get("location") || "").trim(),
    };

    setBusyId(editing._id);

    try {
      const data = await apiFetch<{ item: MenuItem }>(
        `/api/vendor/menu-items/${editing._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          email,
        },
      );
      setItems(
        items.map((entry) =>
          entry._id === data.item._id ? data.item : entry,
        ),
      );
      setEditingId(null);
      toast.success("Menu item updated");
    } catch (editError) {
      if (redirectToSubscription(editError)) return;
      toast.error(
        editError instanceof Error
          ? editError.message
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
        `/api/vendor/menu-items/${item._id}`,
        { method: "DELETE", email },
      );
      setItems(items.filter((entry) => entry._id !== item._id));
      setDeleteId(null);
      toast.success(data.message || "Menu item deleted");
    } catch (deleteError) {
      if (redirectToSubscription(deleteError)) return;
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "We could not delete this item.",
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
            className="h-52 rounded-3xl border border-border bg-card p-6"
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
          We could not load your menu items
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
        <p className="font-script text-2xl text-accent">Your creations</p>
        <h1 className="mt-1 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
          My Menu Items
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          Edit, activate, or retire the pies you have shared with PizzaHub.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="font-script text-2xl text-accent">An empty menu card</p>
          <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
            You have not added any items yet
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/70">
            Add your first menu item to start building your kitchen catalog.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
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
                        {item.category} · {item.location}
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
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        item.active
                          ? "border-primary text-primary"
                          : "border-border text-foreground/60"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => void handleToggle(item)}
                  disabled={busyId === item._id}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {busyId === item._id
                    ? "Updating…"
                    : item.active
                      ? "Set Inactive"
                      : "Set Active"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(item._id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>

                {deleteId === item._id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      disabled={busyId === item._id}
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
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

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8">
            <p className="font-script text-2xl text-accent">Refine the details</p>
            <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
              Edit Menu Item
            </h2>

            <form
              key={editing._id}
              onSubmit={handleEdit}
              className="mt-5 space-y-4"
            >
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
                  Item Name
                </span>
                <input
                  name="itemName"
                  type="text"
                  required
                  defaultValue={editing.itemName}
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
                  Category
                </span>
                <select
                  name="category"
                  required
                  defaultValue={editing.category}
                  className={fieldClass}
                >
                  {EDITORIAL_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
                  Description
                </span>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editing.description}
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
                    Price
                  </span>
                  <input
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    defaultValue={editing.price}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
                    Location
                  </span>
                  <input
                    name="location"
                    type="text"
                    required
                    defaultValue={editing.location}
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={busyId === editing._id}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
