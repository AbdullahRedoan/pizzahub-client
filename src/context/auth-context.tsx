"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { clearServerJwt } from "@/lib/api-client";
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

type SessionUserLike = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: unknown;
  businessName?: string | null;
  subscriptionPlan?: string | null;
  isBlocked?: boolean | null;
};

type SessionAtomState = {
  data?: { user?: SessionUserLike | null } | null;
};

type AuthSessionValue = {
  user: AuthUser | null;
  isPending: boolean;
  signOut: () => Promise<void>;
  refetch: () => Promise<AuthUser | null>;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

function toUserRole(value: unknown): UserRole {
  return value === "vendor" || value === "admin" ? value : "customer";
}

function toAuthUser(
  sessionUser: SessionUserLike | null | undefined,
): AuthUser | null {
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
}

/** Single source of truth for the live Better Auth session. */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, isPending, refetch: refetchSession } = authClient.useSession();
  const [user, setUser] = useState<AuthUser | null>(() =>
    toAuthUser(data?.user),
  );

  useEffect(() => {
    setUser(toAuthUser(data?.user));
  }, [data]);

  const refetch = useCallback(async () => {
    await refetchSession({ query: { disableCookieCache: true } });

    // Better Auth updates its session atom before refetch() resolves. Read that
    // fresh value now so callers can react without waiting for another render.
    const sessionState = authClient.$store.atoms.session.get() as
      | SessionAtomState
      | undefined;
    const freshUser = toAuthUser(sessionState?.data?.user);
    setUser(freshUser);
    return freshUser;
  }, [refetchSession]);

  const signOut = useCallback(async () => {
    clearServerJwt();
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
