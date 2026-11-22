import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";

const DATABASE_NAME = "pizzahubdb";

const globalForAuth = globalThis as typeof globalThis & {
  __pizzahubMongoClient?: MongoClient;
};

type MongoClientWithTopology = MongoClient & {
  topology?: { isDestroyed(): boolean };
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `[auth] Missing or empty ${name}. Check pizzahub-client/.env before starting the app.`,
    );
  }
  return value;
}

/**
 * The driver closes a topology when its first connection attempt fails. Never
 * hand that closed client to Better Auth again; otherwise every later request
 * fails with "Topology is closed" until the whole dev server is restarted.
 */
function isClientClosed(client: MongoClient): boolean {
  return Boolean((client as MongoClientWithTopology).topology?.isDestroyed());
}

/** Reuse one live MongoClient across Next.js dev reloads and route bundles. */
function getMongoClient(): MongoClient {
  const cached = globalForAuth.__pizzahubMongoClient;
  const closed = cached ? isClientClosed(cached) : true;
  if (cached && closed) {
    console.warn(
      "[auth] Cached MongoDB client was closed after a failed connection; creating a fresh one.",
    );
  }
  if (!cached || closed) {
    const client = new MongoClient(requireEnv("MONGODB_URI"));
    globalForAuth.__pizzahubMongoClient = client;
    return client;
  }
  return cached;
}

function createAuth() {
  try {
    const client = getMongoClient();
    const db = client.db(DATABASE_NAME);

    return betterAuth({
      secret: requireEnv("BETTER_AUTH_SECRET"),
      baseURL: requireEnv("BETTER_AUTH_URL"),
      database: mongodbAdapter(db, { client }),
      // Stripe's webhook writes subscriptionPlan directly to MongoDB. A cached
      // session cookie would keep returning the old plan after checkout, so
      // get-session must always read the live user document.
      session: {
        cookieCache: { enabled: false },
      },
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        facebook: {
          clientId: (process.env.FACEBOOK_CLIENT_ID || "").trim(),
          clientSecret: (process.env.FACEBOOK_CLIENT_SECRET || "").trim(),
          scopes: ["email", "public_profile"],
          getUserInfo: async (token) => {
            const res = await fetch(
              `https://graph.facebook.com/v21.0/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(token.accessToken || "")}`,
            );
            if (!res.ok) return null;
            const profile = await res.json();
            return {
              user: {
                id: profile.id,
                name: profile.name || "Facebook User",
                email: profile.email || `${profile.id}@facebook.pizzahub.local`,
                image: profile.picture?.data?.url,
                emailVerified: Boolean(profile.email),
              },
              data: profile,
            };
          },
        },
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            defaultValue: "customer",
            input: true,
          },
          isBlocked: {
            type: "boolean",
            defaultValue: false,
            input: false,
          },
          businessName: {
            type: "string",
            required: false,
            input: true,
          },
          subscriptionPlan: {
            type: "string",
            defaultValue: "free",
            input: false,
          },
          subscriptionExpiresAt: {
            type: "date",
            required: false,
            input: false,
          },
        },
      },
      databaseHooks: {
        user: {
          create: {
            // Public registration may only self-assign customer or vendor.
            // Anything else (admin, typos, injected values) is forced to customer.
            before: async (user) => {
              const requestedRole = user.role;
              const role =
                requestedRole === "customer" || requestedRole === "vendor"
                  ? requestedRole
                  : "customer";

              return { data: { ...user, role } };
            },
          },
        },
      },
    });
  } catch (error) {
    console.error(
      "[auth] Failed to initialize Better Auth. Verify BETTER_AUTH_SECRET, BETTER_AUTH_URL, and MONGODB_URI.",
      error,
    );
    throw error;
  }
}

export const auth = createAuth();
