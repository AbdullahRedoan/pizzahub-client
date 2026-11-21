"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuGrid } from "@/components/menu/menu-grid";
import { MenuGridSkeleton } from "@/components/menu/menu-skeletons";
import { apiFetch, type MenuItem } from "@/lib/api-client";

export function FeaturedSection() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    apiFetch<{ items: MenuItem[] }>("/api/menu-items?featured=true", {
      signal: controller.signal,
    })
      .then((data) => {
        if (!active) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="font-script text-2xl text-accent">
            Fresh from the neighborhood ovens
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl lg:text-5xl">
            Today&apos;s most loved pies
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
            Six standouts from local kitchens we trust — fired to order and on
            their way while still blistered and warm.
          </p>
        </div>

        <Link
          href="/menu"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent md:self-auto"
        >
          Browse all pizza
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10">
        {isLoading ? (
          <MenuGridSkeleton />
        ) : items.length > 0 ? (
          <MenuGrid items={items} />
        ) : (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="font-script text-2xl text-accent">Ovens warming up</p>
            <h3 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
              No featured pies just yet
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/70">
              Once local kitchens publish approved items, the best of the batch
              will land right here.
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Browse the full menu
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
