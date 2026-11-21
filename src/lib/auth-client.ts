import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
// Type-only import keeps the server auth instance (and MongoDB) out of the
// client bundle while still giving the plugin our inferred user schema.
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, useSession } = authClient;
