"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { RoleGuard } from "@/components/dashboard/dashboard-shell";
import { useAuthSession } from "@/context/auth-context";

type ConfirmStatus = "confirming" | "confirmed" | "error";

function SuccessCard({ sessionId }: { sessionId: string | null }) {
  const { refetch } = useAuthSession();
  const [status, setStatus] = useState<ConfirmStatus>("confirming");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let active = true;

    async function waitForWebhook() {
      try {
        // The URL is only a reference. Stripe's webhook is the sole source of
        // truth for activation, so refresh now and once more after it lands.
        await refetch();
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (!active) return;
        await refetch();
        if (active) setStatus("confirmed");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        toast.error(
          error instanceof Error
            ? error.message
            : "We could not refresh your subscription yet.",
        );
      }
    }

    void waitForWebhook();

    return () => {
      active = false;
    };
  }, [refetch]);

  return (
    <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
      <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-4 font-script text-3xl text-accent">A perfect finish</p>
      <h1 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
        Payment Successful
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/70">
        {status === "confirming"
          ? "Stripe is confirming your Premium subscription. We are refreshing your dashboard..."
          : status === "error"
            ? "We could not refresh your plan yet. Please reload this page in a moment."
            : "Your Premium plan is active and your dashboard has been refreshed."}
      </p>
      {sessionId ? (
        <p className="mt-4 break-all font-mono text-xs text-foreground/50">
          Confirmation reference: {sessionId}
        </p>
      ) : null}
      {status === "confirmed" ? (
        <Link
          href="/dashboard/vendor"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Go to Vendor Dashboard
        </Link>
      ) : null}
    </div>
  );
}

export function PaymentSuccessView({
  sessionId,
}: {
  sessionId: string | null;
}) {
  return (
    <RoleGuard>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <SuccessCard sessionId={sessionId} />
      </div>
    </RoleGuard>
  );
}
