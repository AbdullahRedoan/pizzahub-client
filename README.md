# PizzaHub

PizzaHub is a full-stack, role-based pizza ordering and vendor management platform. Customers can browse and order from local kitchens, vendors can manage menus and subscriptions, and admins can moderate users, menu items, and view verified Stripe transactions.

## Live Links

- **Live Website:** https://pizzahub-client-gamma.vercel.app/
- **Live Server:** https://pizzahub-server-tau.vercel.app/
- **Client Repository:** https://github.com/AbdullahRedoan/pizzahub-client
- **Server Repository:** https://github.com/AbdullahRedoan/pizzahub-server

## Key Features

- **Role-based dashboards** for Customer, Vendor, and Admin with protected routes and role-aware navigation.
- **Authentication with Better Auth**: email/password sign-up and sign-in, plus Google and Facebook OAuth.
- **Menu browsing** with search, category filter, location filter, price sorting, and featured items. Premium vendor items are prioritized in public listings.
- **Order flow**: customers place orders, vendors manage incoming order status, and customers track their order history.
- **Vendor menu management**: add, update, activate/deactivate, and delete menu items with image upload (ImgBB) or direct image URL fallback.
- **Free/Premium vendor plans**: Free plan allows up to 3 active menu items; Premium is a recurring $29/month Stripe subscription with unlimited active items.
- **Stripe billing with webhook-only activation**: Premium is activated only after a verified `checkout.session.completed` webhook with `payment_status: "paid"`. Cancellations/failed renewals downgrade vendors through Stripe webhooks.
- **Admin moderation**: manage users, block/unblock accounts, review/approve/reject menu items, and view a read-only Stripe transaction ledger.
- **Polished UI/UX**: editorial design system, responsive layouts, semantic Tailwind tokens, light/dark theme support, skeleton/loading states, and toast-based error feedback.

## Technology Stack

### Client

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Auth:** Better Auth, `@better-auth/mongo-adapter`
- **Styling/UI:** Tailwind CSS 4, shadcn/ui, Base UI, class-variance-authority, tw-animate-css
- **Animation/Icons:** Framer Motion, Lucide React
- **UX:** next-themes, Sonner
- **Data/Utilities:** MongoDB driver (Better Auth adapter), custom fetch API client

### Server

- **Runtime/Framework:** Node.js, Express 5
- **Database:** MongoDB Atlas (`mongodb`)
- **Auth:** JWT (`jsonwebtoken`) for API authorization
- **Billing:** Stripe
- **Utilities:** CORS, dotenv

## Installation

### 1. Clone repositories

```bash
git clone https://github.com/AbdullahRedoan/pizzahub-client.git
git clone https://github.com/AbdullahRedoan/pizzahub-server.git
```

### 2. Install dependencies

```bash
# Client
cd pizzahub-client
npm install

# Server
cd ../pizzahub-server
npm install
```

## Environment Variables

Create `.env` files locally from the examples below. **Do not commit `.env` files or secrets.**

### Client (`pizzahub-client/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string used by Better Auth |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth |
| `BETTER_AUTH_URL` | Client base URL (local: `http://localhost:3000`, prod: deployed client URL) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth app ID |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth app secret |
| `NEXT_PUBLIC_API_URL` | Express server base URL |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB API key for optional image uploads |

### Server (`pizzahub-server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default `5000`) |
| `DB_USER` | MongoDB Atlas username |
| `DB_PASSWORD` | MongoDB Atlas password |
| `JWT_SECRET` | Secret for signing Express JWTs |
| `CLIENT_URL` | Client URL for Stripe success/cancel redirects |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

## Run Locally

### Start the server

```bash
cd pizzahub-server
node index.js
```

Server runs at `http://localhost:5000` by default.

### Start the client

```bash
cd pizzahub-client
npm run dev
```

Client runs at `http://localhost:3000`.

## Implementation Notes (Challenges)

### API Query Parameters

- **Public menu browsing (`GET /api/menu-items`)** supports `search`, `category`, `location`, `sort`, and `featured=true`.
  - `search` is trimmed and matched case-insensitively against `itemName` and `description` using an escaped RegExp.
  - `category` filters exact category unless `ALL`.
  - `location` filters by case-insensitive location match unless `ALL`.
  - `sort` supports `asc`/`desc` by price; premium vendors are always prioritized first (`vendorPremium: -1`) before price/date sorting.
  - `featured=true` limits results to the featured set.
- **Admin user listing (`GET /api/admin/users`)** supports `search` and `role`.
  - `search` matches `name` or `email` case-insensitively.
  - `role` is validated against allowed roles before applying the filter.
- **Client URL sync**: the menu browser keeps filter state in URL query params (`search`, `category`, `location`, `sort`) using `URLSearchParams` and `router.replace(...)`, so filters are shareable/reload-safe.

### Middleware Flow

- **Client edge proxy (`src/proxy.ts`)**: performs an optimistic cookie-presence check for Better Auth session cookies on protected routes (`/dashboard`, `/menu/:id+`, `/profile-settings`, `/payment`). It only redirects unauthenticated users to `/sign-in`; it does **not** trust cookie contents for authorization.
- **Client role guard (`RoleGuard`)**: reads the live Better Auth session from context, handles pending/loading, blocks suspended users, and redirects unauthorized roles to their own dashboard. This prevents cross-role dashboard access after login.
- **Server auth middleware (`middleware/auth.js`)**:
  1. `verifyToken` extracts `Bearer` JWT, verifies it with `JWT_SECRET`, resolves the live user record from MongoDB, rejects missing/invalid/blocked users, and attaches a sanitized `req.user`.
  2. `verifyRole(...roles)` checks `req.user.role` and returns `403` for insufficient permissions.
  3. Route groups apply middleware per resource: e.g. `adminRoutes` uses `router.use(auth.verifyToken, auth.verifyAdmin)`, vendor routes use `verifyToken + verifyVendor`, customer routes use `verifyToken + verifyCustomer`.
- **Server-side verification principle**: protected API behavior is enforced on the server (role, ownership, block status, plan limits), not only in client UI.

## Security & Production Notes

- **Environment variables only**: Better Auth config, MongoDB credentials, Stripe keys, Google/Facebook OAuth credentials, and ImgBB key are read from environment variables.
- **No secrets committed**: `.env` files are ignored and should never be pushed to GitHub.
- **Server-side role verification**: all protected APIs verify JWT and role/ownership server-side.
- **Premium activation is webhook-only**: the client cannot activate Premium directly. Stripe webhook signature is verified with raw request body before `express.json()`.
- **Production route stability**: role guards, live session refetching, and client/server checks are used to avoid stale-session and reload issues on protected routes.

## Deployment Notes

- Deploy **client** on Vercel and set client env vars in Vercel Project Settings.
- Deploy **server** on Vercel (or a Node host) and set server env vars.
- Set `BETTER_AUTH_URL` and `CLIENT_URL` to the deployed client URL.
- Configure Google/Facebook OAuth callback URLs for the deployed client domain.
- Configure Stripe webhook endpoint to the deployed server `/api/stripe/webhook` with the correct signing secret.