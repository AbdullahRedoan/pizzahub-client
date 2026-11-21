import { Suspense } from "react";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { MenuGridSkeleton } from "@/components/menu/menu-skeletons";

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <div className="h-7 w-64 rounded-full bg-foreground/10" />
            <div className="mt-3 h-12 w-80 rounded-full bg-foreground/10" />
          </div>
          <div className="mt-8 rounded-3xl border border-border bg-card p-5">
            <div className="h-10 w-full rounded-full bg-foreground/10" />
          </div>
          <div className="mt-6">
            <MenuGridSkeleton />
          </div>
        </div>
      }
    >
      <MenuBrowser />
    </Suspense>
  );
}
