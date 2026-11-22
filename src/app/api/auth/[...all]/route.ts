import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Cache Components keeps this handler request-time (ƒ); Next 16 rejects
// `dynamic = "force-dynamic"` when `cacheComponents: true` is enabled.
export const { GET, POST } = toNextJsHandler(auth);
