"use client";

import { AdminMenuItemsView } from "@/components/dashboard/admin-menu-items-view";
import { AdminOverviewView } from "@/components/dashboard/admin-overview-view";
import { AdminTransactionsView } from "@/components/dashboard/admin-transactions-view";
import { AdminUsersView } from "@/components/dashboard/admin-users-view";
import { DashboardShell, RoleGuard } from "@/components/dashboard/dashboard-shell";
import { useAuthSession, type UserRole } from "@/context/auth-context";

const ADMIN_ROLES: UserRole[] = ["admin"];

export type AdminSection = "overview" | "users" | "menu-items" | "transactions";

export function AdminDashboard({ section }: { section: AdminSection }) {
  const { user } = useAuthSession();

  return (
    <RoleGuard allowedRoles={ADMIN_ROLES}>
      <DashboardShell role="admin">
        {user ? (
          section === "overview" ? (
            <AdminOverviewView email={user.email} />
          ) : section === "users" ? (
            <AdminUsersView
              email={user.email}
              currentUserId={user.id}
              currentUserEmail={user.email}
            />
          ) : section === "menu-items" ? (
            <AdminMenuItemsView email={user.email} />
          ) : (
            <AdminTransactionsView email={user.email} />
          )
        ) : null}
      </DashboardShell>
    </RoleGuard>
  );
}
