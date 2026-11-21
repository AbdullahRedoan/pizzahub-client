import { PizzaCard, type PizzaCardData } from "@/components/menu/pizza-card";
import type { MenuItem } from "@/lib/api-client";

function toCardData(item: MenuItem): PizzaCardData {
  const status =
    item.status === "approved" && item.active
      ? "Available"
      : item.status.charAt(0).toUpperCase() + item.status.slice(1);

  return {
    id: item._id,
    name: item.itemName,
    description: item.description,
    price: item.price,
    category: item.category,
    vendorName: item.vendorName || "PizzaHub kitchen",
    area: item.location || "PizzaHub",
    status,
    premium: Boolean(item.vendorPremium),
    image: item.images?.[0],
  };
}

type MenuGridProps = {
  items: MenuItem[];
  onViewDetails?: (id: string) => void;
};

export function MenuGrid({ items, onViewDetails }: MenuGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <PizzaCard
          key={item._id}
          pizza={toCardData(item)}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
