import { Flame, Truck, Wheat, type LucideIcon } from "lucide-react";

type Benefit = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  metric: string;
};

const BENEFITS: Benefit[] = [
  {
    icon: Wheat,
    eyebrow: "The foundation",
    title: "Artisanal sourdough",
    description:
      "Flour, water, salt and time. Our partners ferment each dough slowly for an airy crumb and a crust that shatters gently.",
    metric: "48h cold ferment",
  },
  {
    icon: Flame,
    eyebrow: "The ingredients",
    title: "San Marzano DOP",
    description:
      "Direct from Italy, our tomatoes bring the sweet-tart balance that makes a Neapolitan pie taste like Naples.",
    metric: "DOP certified",
  },
  {
    icon: Truck,
    eyebrow: "The journey",
    title: "Ultra-fast thermal tracking",
    description:
      "Insulated courier boxes and live heat-status updates keep every order at oven-warm temperature until it reaches you.",
    metric: "25 min average",
  },
];

export function BenefitsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-script text-2xl text-accent">The PizzaHub standard</p>
        <h2 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl lg:text-5xl">
          Why Choose PizzaHub?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
          Great pizza is a chain of small obsessions. Here are the three we
          refuse to compromise on.
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article
              key={benefit.title}
              className="flex flex-col gap-4 bg-card p-6 lg:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/60">
                {benefit.eyebrow}
              </p>
              <h3 className="font-serif text-2xl font-bold italic text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-foreground/70">
                {benefit.description}
              </p>
              <p className="mt-auto pt-4 font-script text-xl text-accent">
                {benefit.metric}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
