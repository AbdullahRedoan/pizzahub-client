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
