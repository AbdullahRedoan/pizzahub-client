"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RoleGuard } from "@/components/dashboard/dashboard-shell";
import { useAuthSession } from "@/context/auth-context";

const MAX_CHECKS = 4;
const POLL_INTERVAL_MS = 1500;

function SuccessCard({ sessionId }: { sessionId: string | null }) {
  const { refetch } = useAuthSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const hasRun = useRef(false);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let active = true;
    const wait = () =>
      new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    async function waitForPremium() {
      for (let attempt = 0; attempt < MAX_CHECKS; attempt += 1) {
        if (!active) return;

        try {
          const user = await refetchRef.current();
          if (!active) return;

          // refetch() returns the live session user, so this reacts to the
          // webhook's MongoDB update instead of a stale closure value.
          if (user?.subscriptionPlan === "premium") break;
        } catch {
          // The webhook may still be processing. Keep polling until the
          // six-second window finishes.
        }

        await wait();
      }

      if (active) setIsChecking(false);
    }

    void waitForPremium();

    return () => {
      active = false;
      // StrictMode remounts effects in development; let the fresh mount start
      // the single active polling loop.
      hasRun.current = false;
    };
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-card p-10 text-center font-sans">
      <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-4 font-script text-3xl text-accent">A perfect finish</p>
      <h1 className="mt-2 font-serif text-3xl font-bold italic text-foreground sm:text-4xl">
        Payment Successful
      </h1>

      {isChecking ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/70">
          Stripe is confirming your Premium subscription. We are refreshing your
          dashboard...
        </p>
      ) : (
        <div className="mt-6">
          <p className="font-serif text-2xl font-bold italic text-foreground">
            Premium Plan Active
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground/70">
            Your Premium plan is active and your dashboard has been refreshed.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/vendor")}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Go to Vendor Dashboard
          </button>
        </div>
      )}

      {sessionId ? (
        <p className="mt-4 break-all font-mono text-xs text-foreground/50">
          Confirmation reference: {sessionId}
        </p>
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
