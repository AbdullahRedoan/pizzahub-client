"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "customer" | "vendor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
};

type AuthSessionValue = {
  user: AuthUser | null;
  isPending: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void | Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

/**
 * Single source of truth for the current session. Better Auth can be connected
 * here later by replacing the local state with `authClient.useSession()`;
 * the rest of the app only depends on `useAuthSession()`.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<AuthSessionValue>(
    () => ({
      user,
      isPending: false,
      isAuthenticated: user !== null,
      setUser,
      logout,
    }),
    [user, logout],
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
