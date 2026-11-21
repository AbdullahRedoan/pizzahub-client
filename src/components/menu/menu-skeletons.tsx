export function MenuCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card"
    >
      <div className="aspect-[4/3] w-full bg-foreground/10" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-3 w-2/3 rounded-full bg-foreground/10" />
        <div className="h-5 w-4/5 rounded-full bg-foreground/10" />
        <div className="h-3 w-full rounded-full bg-foreground/10" />
        <div className="h-3 w-5/6 rounded-full bg-foreground/10" />
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <div className="h-6 w-20 rounded-full bg-foreground/10" />
          <div className="h-8 w-28 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}

export function MenuGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <MenuCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ItemDetailsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="h-9 w-36 rounded-full bg-foreground/10" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <div className="aspect-[4/3] rounded-3xl border border-border bg-foreground/10" />
          <div className="mt-4 flex gap-3">
            <div className="h-20 w-20 rounded-3xl border border-border bg-foreground/10" />
            <div className="h-20 w-20 rounded-3xl border border-border bg-foreground/10" />
            <div className="h-20 w-20 rounded-3xl border border-border bg-foreground/10" />
          </div>
        </div>
        <div className="space-y-5 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="h-6 w-32 rounded-full bg-foreground/10" />
          <div className="h-10 w-4/5 rounded-full bg-foreground/10" />
          <div className="h-3 w-full rounded-full bg-foreground/10" />
          <div className="h-3 w-5/6 rounded-full bg-foreground/10" />
          <div className="h-3 w-2/3 rounded-full bg-foreground/10" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 rounded-3xl border border-border bg-foreground/10" />
            <div className="h-24 rounded-3xl border border-border bg-foreground/10" />
          </div>
          <div className="h-12 w-full rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}
