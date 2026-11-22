export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const JWT_STORAGE_PREFIX = "pizzahub:server-jwt:";
const ACTIVE_JWT_EMAIL_KEY = `${JWT_STORAGE_PREFIX}active-email`;
const pendingJwtRequests = new Map<string, Promise<string | null>>();

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type MenuItemStatus = "pending" | "approved" | "rejected";
export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type UserRole = "customer" | "vendor" | "admin";

/** Matches the document written by pizzahub-server's menu routes. */
export interface MenuItem {
  _id: string;
  vendorId: string;
  vendorName: string;
  vendorPremium: boolean;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: MenuItemStatus;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

/** Matches the document written by POST /api/orders. */
export interface OrderRecord {
  _id: string;
  itemId: string;
  status: OrderStatus;
  itemName: string;
  itemPrice: number;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

/** Matches the verified Stripe transaction records. */
export interface TransactionRecord {
  _id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  plan: "Premium" | "premium";
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "succeeded";
  createdAt: string;
}

/** Matches the sanitized `user` collection documents. */
export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  businessName?: string;
  subscriptionPlan: "free" | "premium";
  subscriptionExpiresAt?: string;
  isBlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function jwtKey(email: string) {
  return `${JWT_STORAGE_PREFIX}${normalizeEmail(email)}`;
}

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();

  if (!text) return {};

  try {
    const value: unknown = JSON.parse(text);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return { message: text };
  } catch {
    return { message: text };
  }
}

function messageFrom(data: Record<string, unknown>, status: number) {
  return typeof data.message === "string" && data.message.trim()
    ? data.message
    : `Request failed (${status})`;
}

function readActiveJwt(): string | null {
  if (typeof window === "undefined") return null;

  const activeEmail = sessionStorage.getItem(ACTIVE_JWT_EMAIL_KEY);
  if (activeEmail) {
    return sessionStorage.getItem(jwtKey(activeEmail));
  }

  // Fallback for a session restored before the active-email pointer existed.
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key && key.startsWith(JWT_STORAGE_PREFIX) && key !== ACTIVE_JWT_EMAIL_KEY) {
      return sessionStorage.getItem(key);
    }
  }

  return null;
}

/** Remove every cached Express JWT. Called by the auth context on sign-out. */
export function clearServerJwt() {
  if (typeof window === "undefined") return;

  const keys: string[] = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith(JWT_STORAGE_PREFIX)) keys.push(key);
  }

  keys.forEach((key) => sessionStorage.removeItem(key));
  pendingJwtRequests.clear();
}

/**
 * Exchange a Better Auth email for an Express-signed JWT, cached per email in
 * sessionStorage so page reloads do not mint a new token each time.
 */
export async function getServerJwt(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  if (!normalized || typeof window === "undefined") return null;

  const key = jwtKey(normalized);
  const cached = sessionStorage.getItem(key);
  if (cached) {
    sessionStorage.setItem(ACTIVE_JWT_EMAIL_KEY, normalized);
    return cached;
  }

  const pending = pendingJwtRequests.get(normalized);
  if (pending) return pending;

  const request = (async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/jwt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized }),
      cache: "no-store",
    });
    const data = await parseJson(response);

    if (!response.ok) {
      throw new ApiError(messageFrom(data, response.status), response.status);
    }

    const token =
      typeof data.token === "string" && data.token.trim() ? data.token : null;

    if (token) {
      sessionStorage.setItem(key, token);
      sessionStorage.setItem(ACTIVE_JWT_EMAIL_KEY, normalized);
    }

    return token;
  })();

  pendingJwtRequests.set(normalized, request);

  try {
    return await request;
  } finally {
    pendingJwtRequests.delete(normalized);
  }
}

type ApiFetchOptions = RequestInit & {
  email?: string | null;
  requireAuth?: boolean;
};

/** Thin fetch wrapper that adds the Express JWT and normalizes error messages. */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { email, requireAuth, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (email || requireAuth) {
    const token = email ? await getServerJwt(email) : readActiveJwt();
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const url = /^https?:\/\//.test(path)
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
    cache: init.cache ?? "no-store",
  });
  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(messageFrom(data, response.status), response.status);
  }

  return data as T;
}
