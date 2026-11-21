"use client";

import { CustomerOrdersView } from "@/components/dashboard/customer-orders-view";
import { CustomerOverviewView } from "@/components/dashboard/customer-overview-view";
import { DashboardShell, RoleGuard } from "@/components/dashboard/dashboard-shell";
import { useAuthSession, type UserRole } from "@/context/auth-context";

const CUSTOMER_ROLES: UserRole[] = ["customer"];

export function CustomerDashboard({
  section,
}: {
  section: "overview" | "orders";
}) {
  const { user } = useAuthSession();

  return (
    <RoleGuard allowedRoles={CUSTOMER_ROLES}>
      <DashboardShell role="customer">
        {user ? (
          section === "orders" ? (
            <CustomerOrdersView email={user.email} />
          ) : (
            <CustomerOverviewView email={user.email} />
          )
        ) : null}
      </DashboardShell>
    </RoleGuard>
  );
}
