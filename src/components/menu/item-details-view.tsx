"use client";

import { ArrowLeft, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuImage } from "@/components/menu/menu-image";
import { OrderModal } from "@/components/menu/order-modal";
import { ItemDetailsSkeleton } from "@/components/menu/menu-skeletons";
import { useAuthSession } from "@/context/auth-context";
import { apiFetch, type MenuItem } from "@/lib/api-client";

const BACK_PILL_CLASS =
  "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-foreground transition-colors hover:text-accent";

type ItemResult = {
  key: string;
  item: MenuItem | null;
  error: string;
};

export function ItemDetailsView({ id }: { id: string }) {
  const router = useRouter();
  const { user, isPending } = useAuthSession();

  const [result, setResult] = useState<ItemResult | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [orderOpen, setOrderOpen] = useState(false);

  const requestKey = `${id}:${user?.email ?? "anonymous"}`;
  const isLoading = result?.key !== requestKey;
  const item = result?.key === requestKey ? result.item : null;
  const error = result?.key === requestKey ? result.error : "";

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    const controller = new AbortController();
    let active = true;

    apiFetch<MenuItem>(`/api/menu-items/${encodeURIComponent(id)}`, {
      email: user.email,
      signal: controller.signal,
    })
      .then((data) => {
        if (!active) return;
        setResult({ key: requestKey, item: data, error: "" });
        setActiveImage(0);
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        const name = fetchError instanceof Error ? fetchError.name : "";
        if (name === "AbortError") return;
        setResult({
          key: requestKey,
          item: null,
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "This item is no longer available.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, isPending, requestKey, router, user]);

  if (isPending || (isLoading && !error)) {
    return <ItemDetailsSkeleton />;
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
          <p className="font-script text-2xl text-accent">This pie slipped away</p>
          <h1 className="mt-2 font-serif text-3xl font-bold italic text-foreground">
            We couldn&apos;t find that item
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/70">
            {error ||
              "It may have been removed, or its kitchen has paused the listing."}
          </p>
          <Link href="/menu" className={`${BACK_PILL_CLASS} mt-6`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  const gallery = item.images?.filter(Boolean).length
    ? item.images.filter(Boolean)
    : ["/images/hero-neapolitan.png"];
  const isAdmin = user?.role === "admin";
  const isVendor = user?.role === "vendor" || user?.id === item.vendorId;
  const canOrder = user?.role === "customer" && !isVendor;
  const disabledNote = isAdmin
    ? "Admin accounts cannot place customer orders"
    : isVendor
      ? "Vendors cannot place customer orders"
      : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <Link href="/menu" className={BACK_PILL_CLASS}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to menu
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="relative aspect-[4/3] w-full bg-background">
              <MenuImage
                src={gallery[activeImage]}
                alt={item.itemName}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1} of ${item.itemName}`}
                  aria-pressed={activeImage === index}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-border bg-card transition-all ${
                    activeImage === index ? "ring-2 ring-accent" : ""
                  }`}
                >
                  <MenuImage
                    src={image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 font-sans sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-foreground/70">
              {item.category}
            </span>
            {item.vendorPremium && (
              <span className="flex items-center gap-1 rounded-full border border-accent/20 bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Star className="h-3 w-3" fill="currentColor" />
                Premium
              </span>
            )}
          </div>

          <h1 className="mt-4 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
            {item.itemName}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-foreground/70">
            {item.description}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-4">
              <p className="font-script text-xl text-accent">From the kitchen</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {item.vendorName || "PizzaHub kitchen"}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-accent">
                <MapPin className="h-4 w-4" />
                <p className="font-script text-xl">Where to find it</p>
              </div>
              <p className="mt-1 text-sm font-medium text-foreground">
                {item.location || "PizzaHub"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground/60">
                Price
              </p>
              <p className="font-serif text-3xl font-bold italic text-primary">
                <span className="text-lg">৳</span> {item.price}
              </p>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-accent">
              {item.status === "approved" && item.active
                ? "Available"
                : "Unavailable"}
            </span>
          </div>

          <div className="mt-7">
            {canOrder ? (
              <button
                type="button"
                onClick={() => setOrderOpen(true)}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Order Now
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground/50"
                >
                  Order Now
                </button>
                <p className="text-center text-xs text-foreground/60">
                  {disabledNote || "Only customer accounts can place orders"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {canOrder && user && (
        <OrderModal
          item={item}
          user={user}
          open={orderOpen}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </div>
  );
}
