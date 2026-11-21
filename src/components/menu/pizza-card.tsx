"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type PizzaCardData = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  category: string;
  vendorName: string;
  area: string;
  rating: number;
  status: string;
  premium?: boolean;
  image?: string;
};

const FALLBACK_IMAGE = "/images/hero-neapolitan.png";

export function PizzaCard({ pizza }: { pizza: PizzaCardData }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background/50">
        <Image
          src={pizza.image ?? FALLBACK_IMAGE}
          alt={pizza.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full border border-border bg-background/90 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-foreground backdrop-blur-sm">
          {pizza.category}
        </span>

        {pizza.premium && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-accent/20 bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            <Star className="h-3 w-3" fill="currentColor" />
            Premium
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wide text-foreground/60">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="truncate">{pizza.area}</span>
          <span className="ml-auto truncate normal-case tracking-normal text-foreground">
            by {pizza.vendorName}
          </span>
        </div>

        <h3 className="line-clamp-1 font-serif text-lg font-semibold italic text-foreground transition-colors group-hover:text-primary sm:text-xl">
          {pizza.name}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Star className="h-3.5 w-3.5 text-accent" fill="currentColor" />
            {pizza.rating.toFixed(1)}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[0.65rem] text-accent">
            {pizza.status}
          </span>
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-foreground/70">
          {pizza.description}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <p className="font-serif text-xl font-bold italic text-primary">
            <span className="text-sm">{pizza.currency ?? "৳"}</span>{" "}
            {pizza.price}
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="shrink-0"
          >
            <Link
              href={`/menu/${pizza.id}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:text-accent"
            >
              View Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </article>
  );
}
