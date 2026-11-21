import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("pizzahubdb");

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: mongodbAdapter(db, { client }),
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
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      scopes: ["email", "public_profile"],
      fields: ["id", "name", "email", "picture"],
      mapProfileToUser: (profile) => {
        // Better Auth types this as a Graph | Limited Login union. Web OAuth
        // returns the Graph shape, but read both shapes so the fallback is safe.
        const raw = profile as {
          id?: string;
          sub?: string;
          name?: string;
          email?: string;
          picture?: string | { data?: { url?: string } };
        };

        return {
          name: raw.name || "Facebook User",
          email:
            raw.email ||
            `${raw.id ?? raw.sub ?? "unknown"}@facebook.pizzahub.local`,
          image:
            typeof raw.picture === "string"
              ? raw.picture
              : raw.picture?.data?.url,
          emailVerified: Boolean(raw.email),
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
