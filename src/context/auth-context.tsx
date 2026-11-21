"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export type UserRole = "customer" | "vendor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  businessName?: string | null;
  subscriptionPlan: string;
  isBlocked: boolean;
};

type AuthSessionValue = {
  user: AuthUser | null;
  isPending: boolean;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

function toUserRole(value: unknown): UserRole {
  return value === "vendor" || value === "admin" ? value : "customer";
}

/** Single source of truth for the live Better Auth session. */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isPending, refetch } = authClient.useSession();

  const user = useMemo<AuthUser | null>(() => {
    const sessionUser = data?.user;

    if (!sessionUser) return null;

    return {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      image: sessionUser.image ?? null,
      role: toUserRole(sessionUser.role),
      businessName: sessionUser.businessName ?? null,
      subscriptionPlan: sessionUser.subscriptionPlan ?? "free",
      isBlocked: sessionUser.isBlocked ?? false,
    };
  }, [data]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    toast.success("Signed out of PizzaHub");
    router.push("/");
  }, [router]);

  const value = useMemo<AuthSessionValue>(
    () => ({ user, isPending, signOut, refetch }),
    [user, isPending, signOut, refetch],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionValue {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used inside an AuthSessionProvider");
  }

  return context;
}
