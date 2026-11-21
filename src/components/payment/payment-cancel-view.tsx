"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/dashboard/dashboard-shell";

export function PaymentCancelView() {
  return (
    <RoleGuard>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
          <p className="font-script text-3xl text-accent">Left at the door</p>
          <h1 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
            Checkout Cancelled
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/70">
            No charges were made. Your kitchen is still on its current plan, and
            you can upgrade whenever you are ready.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/vendor/subscription"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Back to Subscription
            </Link>
            <Link
              href="/dashboard/vendor"
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Vendor Dashboard
            </Link>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
