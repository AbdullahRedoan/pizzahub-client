export const CATEGORY_OPTIONS = [
  "All Categories",
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

/** Older home-page links used short slugs; keep them working as aliases. */
const CATEGORY_ALIASES: Record<string, CategoryOption> = {
  classic: "Classic Pizzas",
  vegetarian: "Vegetarian Pizzas",
  "meat-lovers": "Meat Lovers",
  gourmet: "Specialty / Gourmet Pizzas",
  sides: "Sides & Appetizers",
  desserts: "Beverages & Desserts",
};

export function normalizeCategory(value: string | null | undefined): CategoryOption {
  const trimmed = value?.trim();
  if (!trimmed) return "All Categories";

  const aliased = CATEGORY_ALIASES[trimmed.toLowerCase()];
  if (aliased) return aliased;

  return CATEGORY_OPTIONS.find((option) => option === trimmed) ?? "All Categories";
}

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "asc", label: "Price: Low to High" },
  { value: "desc", label: "Price: High to Low" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export function normalizeSort(value: string | null | undefined): SortOption {
  return value === "asc" || value === "desc" ? value : "featured";
}
