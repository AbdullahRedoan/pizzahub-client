"use client";

import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  ShieldAlert,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import {
  useAuthSession,
  type UserRole,
} from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { getDashboardRouteByRole } from "@/lib/role-redirect";

type SidebarLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const ROLE_LABEL: Record<UserRole, string> = {
  customer: "Customer Table",
  vendor: "Vendor Kitchen",
  admin: "Admin Hearth",
};

const NAV_ITEMS: Record<UserRole, SidebarLink[]> = {
  customer: [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "My Orders", href: "/dashboard/customer/orders", icon: ShoppingBag },
    { label: "Profile Settings", href: "/profile-settings", icon: Settings },
  ],
  vendor: [
    { label: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
    { label: "My Menu Items", href: "/dashboard/vendor/my-items", icon: UtensilsCrossed },
    { label: "Add Menu Item", href: "/dashboard/vendor/add-item", icon: PlusCircle },
    { label: "Customer Orders", href: "/dashboard/vendor/orders", icon: ClipboardList },
    { label: "Subscription", href: "/dashboard/vendor/subscription", icon: CreditCard },
    { label: "Profile Settings", href: "/profile-settings", icon: Settings },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: ShieldAlert },
    { label: "Manage Menu Items", href: "/dashboard/admin/menu-items", icon: UtensilsCrossed },
    { label: "Transactions", href: "/dashboard/admin/transactions", icon: CreditCard },
    { label: "Profile Settings", href: "/profile-settings", icon: Settings },
  ],
};

function GuardSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md animate-pulse space-y-4 rounded-3xl border border-border bg-card p-8">
        <div className="h-4 w-32 rounded-full bg-foreground/10" />
        <div className="h-9 w-3/4 rounded-full bg-foreground/10" />
        <div className="h-3 w-full rounded-full bg-foreground/10" />
        <div className="h-3 w-5/6 rounded-full bg-foreground/10" />
        <div className="h-10 w-full rounded-full bg-foreground/10" />
      </div>
    </div>
  );
}

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { user, isPending, signOut } = useAuthSession();
  const redirectedRef = useRef(false);
  const isAllowed = !allowedRoles || (user ? allowedRoles.includes(user.role) : false);

  useEffect(() => {
    if (isPending) return;

    if (!user || isAllowed || user.isBlocked) {
      redirectedRef.current = false;
      return;
    }

    if (redirectedRef.current) return;
    redirectedRef.current = true;
    toast.error("Access restricted to authorized role");
    router.replace(getDashboardRouteByRole(user.role));
  }, [isAllowed, isPending, router, user]);

  if (isPending || !user) return <GuardSkeleton />;

  if (user.isBlocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 text-center font-sans">
          <p className="font-script text-3xl text-accent">The oven is closed</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold italic text-foreground sm:text-4xl">
            Account Suspended
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground/70">
            Your PizzaHub account has been blocked by an administrator. Reach
            out to support if you believe this was a mistake.
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!isAllowed) return <GuardSkeleton />;

  return <>{children}</>;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarFallback({ role }: { role: UserRole }) {
  return (
    <aside className="space-y-5 rounded-3xl border border-border bg-card p-5 lg:col-span-3">
      <div className="h-3 w-24 rounded-full bg-foreground/10" />
      <div className="h-7 w-40 rounded-full bg-foreground/10" />
      <div className="space-y-2 pt-2">
        {NAV_ITEMS[role].map((item) => (
          <div
            key={item.href}
            className="h-10 w-full rounded-full bg-foreground/10"
          />
        ))}
      </div>
    </aside>
  );
}

function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="space-y-5 rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-24 lg:col-span-3 lg:self-start">
      <div>
        <p className="font-script text-2xl text-accent">Welcome back</p>
        <h2 className="mt-1 font-serif text-2xl font-bold italic text-foreground">
          {ROLE_LABEL[role]}
        </h2>
      </div>

      <nav aria-label="Dashboard navigation" className="space-y-2">
        {NAV_ITEMS[role].map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:text-accent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

type DashboardShellProps = {
  role: UserRole;
  children: ReactNode;
};

export function DashboardShell({ role, children }: DashboardShellProps) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8">
      <Suspense fallback={<SidebarFallback role={role} />}>
        <DashboardSidebar role={role} />
      </Suspense>
      <div className="space-y-6 lg:col-span-9">{children}</div>
    </div>
  );
}
