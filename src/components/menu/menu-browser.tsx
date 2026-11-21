"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MenuGrid } from "@/components/menu/menu-grid";
import { MenuGridSkeleton } from "@/components/menu/menu-skeletons";
import { useAuthSession } from "@/context/auth-context";
import { apiFetch, type MenuItem } from "@/lib/api-client";
import {
  CATEGORY_OPTIONS,
  SORT_OPTIONS,
  normalizeCategory,
  normalizeSort,
  type CategoryOption,
  type SortOption,
} from "@/lib/menu-filters";

const SEARCH_DEBOUNCE_MS = 350;

type MenuResult = {
  key: string;
  items: MenuItem[];
  error: string;
};

type MenuFilters = {
  search: string;
  category: CategoryOption;
  location: string;
  sort: SortOption;
};

function buildQuery(filters: MenuFilters) {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category !== "All Categories") {
    params.set("category", filters.category);
  }
  if (filters.location.trim()) params.set("location", filters.location.trim());
  if (filters.sort !== "featured") params.set("sort", filters.sort);

  return params.toString();
}

export function MenuBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isPending } = useAuthSession();

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [category, setCategory] = useState<CategoryOption>(() =>
    normalizeCategory(searchParams.get("category")),
  );
  const [location, setLocation] = useState(
    () => searchParams.get("location") ?? "",
  );
  const [sort, setSort] = useState<SortOption>(() =>
    normalizeSort(searchParams.get("sort")),
  );

  const [result, setResult] = useState<MenuResult | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const filters = { search: debouncedSearch, category, location, sort };
  const query = buildQuery(filters);
  const isLoading = result?.key !== query;
  const items = result?.key === query ? result.items : [];
  const error = result?.key === query ? result.error : "";

  useEffect(() => {
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, query, router]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    apiFetch<{ items: MenuItem[] }>(
      `/api/menu-items${query ? `?${query}` : ""}`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (!active) return;
        setResult({
          key: query,
          items: Array.isArray(data.items) ? data.items : [],
          error: "",
        });
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        const name = fetchError instanceof Error ? fetchError.name : "";
        if (name === "AbortError") return;
        setResult({
          key: query,
          items: [],
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "We could not load the menu right now.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [query]);

  const handleViewDetails = useCallback(
    (id: string) => {
      if (!isPending && !user) {
        toast.info("Please sign in to view item details and place an order");
        router.push("/sign-in");
        return;
      }

      if (user) router.push(`/menu/${id}`);
    },
    [isPending, router, user],
  );

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setCategory("All Categories");
    setLocation("");
    setSort("featured");
  }, []);

  const selectClass =
    "w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-2xl">
        <p className="font-script text-2xl text-accent">
          The neighborhood oven, at a glance
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl lg:text-5xl">
          Browse the menu
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
          Every approved pie currently being fired by local kitchens. Filter by
          craving, neighborhood or price — then save a seat in your order book.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-4 font-sans sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <label className="relative block">
            <span className="sr-only">Search menu items</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or description"
              className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(normalizeCategory(event.target.value))
              }
              className={selectClass}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filter by location</span>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location or area"
              className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/50 focus:border-accent"
            />
          </label>

          <label className="block">
            <span className="sr-only">Sort by price</span>
            <select
              value={sort}
              onChange={(event) =>
                setSort(normalizeSort(event.target.value))
              }
              className={selectClass}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 font-sans text-sm text-foreground/70">
        <p>
          {isLoading
            ? "Checking the ovens…"
            : `${items.length} ${items.length === 1 ? "pie" : "pies"} ready to order`}
        </p>
        {(searchInput || category !== "All Categories" || location || sort !== "featured") && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:text-accent"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <MenuGridSkeleton />
        ) : items.length > 0 ? (
          <MenuGrid items={items} onViewDetails={handleViewDetails} />
        ) : (
          <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
            <p className="font-script text-2xl text-accent">
              {error ? "A little kitchen trouble" : "No pies on this tray"}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold italic text-foreground">
              {error ? "We could not reach the ovens" : "Nothing matches those filters"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/70">
              {error ||
                "Try a different craving, neighborhood or price range — the menu changes as kitchens publish new items."}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
