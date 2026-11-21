import { ChefHat, PackageCheck, ShoppingBag, type LucideIcon } from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: ShoppingBag,
    title: "Browse & Order",
    description:
      "Explore neighborhood menus, compare crusts and toppings, then check out in a few taps.",
  },
  {
    number: "02",
    icon: ChefHat,
    title: "Crafted & Fired",
    description:
      "Your chosen kitchen stretches, tops and fires the pie only after your order lands.",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "Swift Delivery",
    description:
      "A tracked courier collects the insulated box and brings it warm to your doorstep.",
  },
];

export function WorkflowSection() {
  return (
    <section className="border-t border-border bg-card py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-2xl text-accent">How it works</p>
          <h2 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl lg:text-5xl">
            Three steps to a hot slice
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
            No guesswork, no cold pizza — just a clear path from craving to
            doorstep.
          </p>
        </div>

        <ol className="mt-12 flex flex-col gap-5 md:flex-row md:items-stretch md:gap-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.number}
                className="flex flex-1 flex-col gap-4 rounded-3xl border border-border bg-background p-6 lg:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-4xl font-bold italic text-accent">
                    {step.number}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold italic text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground/70">
                  {step.description}
                </p>
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="mt-auto hidden h-px w-full bg-border md:block"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
