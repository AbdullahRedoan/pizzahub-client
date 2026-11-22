"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PaymentSuccessView } from "@/components/payment/payment-success-view";

function PaymentSuccessWithSession() {
  const searchParams = useSearchParams();
  // Display-only reference; activation happens exclusively in Stripe's webhook.
  const sessionId = searchParams.get("session_id");

  return <PaymentSuccessView sessionId={sessionId} />;
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-12 text-center text-sm text-foreground/60 sm:px-6 lg:px-8">
          Confirming your payment...
        </div>
      }
    >
      <PaymentSuccessWithSession />
    </Suspense>
  );
}
