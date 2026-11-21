"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { RoleGuard } from "@/components/dashboard/dashboard-shell";
import { useAuthSession } from "@/context/auth-context";

function SuccessCard() {
  const { refetch } = useAuthSession();
  const hasRefetched = useRef(false);

  useEffect(() => {
    if (hasRefetched.current) return;
    hasRefetched.current = true;

    async function refreshPlan() {
      await refetch();
    }

    void refreshPlan().catch(() => undefined);
  }, [refetch]);

  return (
    <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
      <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-4 font-script text-3xl text-accent">A perfect finish</p>
      <h1 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
        Payment Successful
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/70">
        Thank you for upgrading your kitchen. Your Premium plan is being
        confirmed now, and your dashboard has been refreshed.
      </p>
      <Link
        href="/dashboard/vendor"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        Go to Vendor Dashboard
      </Link>
    </div>
  );
}

export function PaymentSuccessView() {
  return (
    <RoleGuard>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <SuccessCard />
      </div>
    </RoleGuard>
  );
}
