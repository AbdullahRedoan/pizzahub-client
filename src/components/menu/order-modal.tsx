"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import type { AuthUser } from "@/context/auth-context";
import {
  apiFetch,
  ApiError,
  type MenuItem,
  type OrderRecord,
} from "@/lib/api-client";

type OrderModalProps = {
  item: MenuItem;
  user: AuthUser;
  open: boolean;
  onClose: () => void;
};

function todayAsInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function OrderModal({ item, user, open, onClose }: OrderModalProps) {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    dateInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      await apiFetch<{ order: OrderRecord }>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item._id,
          deliveryDate,
          deliveryAddress,
          message,
        }),
        email: user.email,
      });

      toast.success("Order placed! Status: Pending");
      setDeliveryDate("");
      setDeliveryAddress("");
      setMessage("");
      onClose();
      router.push("/dashboard/customer/orders");
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 409 || error.status === 403)
      ) {
        toast.error(error.message);
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "We could not place your order. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const minDate = todayAsInputValue();
  const fieldClass =
    "w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        aria-describedby="order-modal-description"
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 font-sans sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-script text-2xl text-accent">Almost at the oven</p>
            <h2
              id="order-modal-title"
              className="mt-1 font-serif text-2xl font-bold italic text-foreground sm:text-3xl"
            >
              Place your order
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:text-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          id="order-modal-description"
          className="mt-5 rounded-3xl border border-border bg-background p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground/60">
                Vendor
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {item.vendorName || "PizzaHub kitchen"}
              </p>
            </div>
            <p className="whitespace-nowrap font-serif text-xl font-bold italic text-primary">
              <span className="text-sm">৳</span> {item.price}
            </p>
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs uppercase tracking-wide text-foreground/60">
              Item
            </p>
            <p className="mt-0.5 font-serif text-lg font-semibold italic text-foreground">
              {item.itemName}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Delivery Date
            </span>
            <input
              ref={dateInputRef}
              type="date"
              required
              min={minDate}
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Delivery Address
            </span>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="House, street, neighborhood"
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-foreground/70">
              Additional Message{" "}
              <span className="normal-case tracking-normal text-foreground/50">
                (optional)
              </span>
            </span>
            <textarea
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Notes for the kitchen or rider"
              className="w-full resize-none rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Placing order…" : "Confirm Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
