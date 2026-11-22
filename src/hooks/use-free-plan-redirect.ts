"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";

export const FREE_PLAN_REDIRECT_MESSAGE =
  "Free plan allows a maximum of 3 active menu items. Upgrade to Premium to add or activate more!";

export function isFreePlan(plan: string | undefined | null) {
  return String(plan || "").toLowerCase() !== "premium";
}

export function isFreePlanLimitError(error: unknown) {
  if (!(error instanceof ApiError) || error.status !== 403) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("free plan") ||
    message.includes("maximum of 3") ||
    message.includes("3 active")
  );
}

/** Toast the plan limit and send the vendor straight to checkout. */
export function useFreePlanRedirect() {
  const router = useRouter();

  return function redirectToSubscription(error?: unknown) {
    if (error !== undefined && !isFreePlanLimitError(error)) return false;

    toast.error(FREE_PLAN_REDIRECT_MESSAGE);
    router.push("/dashboard/vendor/subscription");
    return true;
  };
}
