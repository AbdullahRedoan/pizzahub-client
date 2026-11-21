"use client";

import { DashboardShell, RoleGuard } from "@/components/dashboard/dashboard-shell";
import { VendorAddItemView } from "@/components/dashboard/vendor-add-item-view";
import { VendorMyItemsView } from "@/components/dashboard/vendor-my-items-view";
import { VendorOrdersView } from "@/components/dashboard/vendor-orders-view";
import { VendorOverviewView } from "@/components/dashboard/vendor-overview-view";
import { VendorSubscriptionView } from "@/components/dashboard/vendor-subscription-view";
import { useAuthSession, type UserRole } from "@/context/auth-context";

const VENDOR_ROLES: UserRole[] = ["vendor"];

export type VendorSection =
  | "overview"
  | "add-item"
  | "my-items"
  | "orders"
  | "subscription";

export function VendorDashboard({ section }: { section: VendorSection }) {
  const { user } = useAuthSession();

  return (
    <RoleGuard allowedRoles={VENDOR_ROLES}>
      <DashboardShell role="vendor">
        {user ? (
          section === "overview" ? (
            <VendorOverviewView
              email={user.email}
              subscriptionPlan={user.subscriptionPlan}
            />
          ) : section === "add-item" ? (
            <VendorAddItemView email={user.email} />
          ) : section === "my-items" ? (
            <VendorMyItemsView email={user.email} />
          ) : section === "orders" ? (
            <VendorOrdersView email={user.email} />
          ) : (
            <VendorSubscriptionView
              email={user.email}
              subscriptionPlan={user.subscriptionPlan}
            />
          )
        ) : null}
      </DashboardShell>
    </RoleGuard>
  );
}
