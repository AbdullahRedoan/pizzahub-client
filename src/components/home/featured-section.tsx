import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PizzaCard, type PizzaCardData } from "@/components/menu/pizza-card";

const FEATURED_PIZZAS: PizzaCardData[] = [
  {
    id: "classic-margherita",
    name: "Classic Margherita",
    description:
      "San Marzano tomato, fior di latte, fresh basil and a slow-fermented crust.",
    price: 890,
    category: "Classic",
    vendorName: "Romano's Pizzeria",
    area: "Dhanmondi",
    rating: 4.9,
    status: "Bestseller",
  },
  {
    id: "hot-honey-diavola",
    name: "Hot Honey Diavola",
    description:
      "Spicy salami, calabrian chilli, smoked mozzarella and a hot honey finish.",
    price: 1190,
    category: "Meat Lovers",
    vendorName: "Napoli Fire Kitchen",
    area: "Gulshan",
    rating: 4.8,
    status: "Trending",
    premium: true,
    image: "/images/pizza/diavola-slice.svg",
  },
  {
    id: "truffle-funghi",
    name: "Truffle Funghi",
    description:
      "Wild mushrooms, taleggio, truffle cream and thyme on a bianca base.",
    price: 1490,
    category: "Gourmet",
    vendorName: "Casa Verde",
    area: "Banani",
    rating: 4.9,
    status: "Chef's pick",
    premium: true,
    image: "/images/pizza/mushroom-slice.svg",
  },
  {
    id: "pepperoni-classic",
    name: "Pepperoni Classic",
    description:
      "Crispy cup-and-char pepperoni, mozzarella and our signature tomato sauce.",
    price: 1090,
    category: "Meat Lovers",
    vendorName: "Romano's Pizzeria",
    area: "Dhanmondi",
    rating: 4.7,
    status: "Available",
  },
  {
    id: "wild-mushroom-bianca",
    name: "Wild Mushroom Bianca",
    description:
      "Roasted mushrooms, garlic cream, scamorza and a shower of fresh basil.",
    price: 1290,
    category: "Vegetarian",
    vendorName: "Forno & Co.",
    area: "Gulshan",
    rating: 4.8,
    status: "New",
    premium: true,
    image: "/images/pizza/mushroom-slice.svg",
  },
  {
    id: "sweet-fig-ricotta",
    name: "Sweet Fig & Ricotta",
    description:
      "Whipped ricotta, fig jam, toasted pistachio and a drizzle of aged balsamic.",
    price: 1390,
    category: "Desserts",
    vendorName: "Dolce Forno",
    area: "Banani",
    rating: 4.9,
    status: "Seasonal",
    premium: true,
  },
];

export function FeaturedSection() {
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
            Six standouts from local kitchens we trust — rated by neighbors,
            fired to order and on their way while still blistered and warm.
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

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_PIZZAS.map((pizza) => (
          <PizzaCard key={pizza.id} pizza={pizza} />
        ))}
      </div>
    </section>
  );
}
