import {
  ArrowUpRight,
  Beef,
  CakeSlice,
  Cookie,
  Gem,
  Leaf,
  Pizza,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type Category = {
  label: string;
  slug: string;
  description: string;
  icon: LucideIcon;
};

const CATEGORIES: Category[] = [
  {
    label: "Classic Pizzas",
    slug: "Classic Pizzas",
    description: "Timeless tomato, cheese and basil.",
    icon: Pizza,
  },
  {
    label: "Vegetarian Pizzas",
    slug: "Vegetarian Pizzas",
    description: "Garden produce, wood-fired.",
    icon: Leaf,
  },
  {
    label: "Meat Lovers",
    slug: "Meat Lovers",
    description: "For the seriously hungry.",
    icon: Beef,
  },
  {
    label: "Specialty / Gourmet",
    slug: "Specialty / Gourmet Pizzas",
    description: "Truffles, taleggio and fine craft.",
    icon: Gem,
  },
  {
    label: "Sides & Appetizers",
    slug: "Sides & Appetizers",
    description: "Garlic knots, salads and more.",
    icon: Cookie,
  },
  {
    label: "Beverages & Desserts",
    slug: "Beverages & Desserts",
    description: "A sweet finish from the oven.",
    icon: CakeSlice,
  },
];

export function CategorySection() {
  return (
    <section className="border-y border-border bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-script text-2xl text-accent">Find your craving</p>
          <h2 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl lg:text-5xl">
            A pie for every mood
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
            From the first bite of a classic margherita to something entirely
            indulgent — start with a category and let the oven do the rest.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.slug}
                href={`/menu?category=${encodeURIComponent(category.slug)}`}
                className="group flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold italic text-foreground transition-colors group-hover:text-primary">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/70">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
