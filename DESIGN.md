# PizzaHut — Editorial Artisanal Design System

## 1. Core Aesthetic & Anti-Slop Rules
- **Visual Benchmark:** High-contrast editorial pizzeria aesthetic inspired by wood-fired craft.
- **Single Layout, Dual Palette:** Light and Dark modes share 100% identical DOM structure, typography, spacing, and borders. NEVER use `dark:` color overrides or hardcoded hex codes inside components. Use ONLY semantic Tailwind tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-accent`).
- **Banned Patterns:** No generic 3-column SaaS feature grids, no purple/blue gradients, no default ShadCN rectangular boxes with heavy drop shadows.
- **ShadCN Overrides:** Restyle `Button`, `Card`, `Sheet`, and `Dialog` using `rounded-full` pill shapes or `rounded-3xl` editorial containers with `1px solid var(--border)` hairline borders.

## 2. Typography Hierarchy (Google Fonts via `next/font/google`)
- **Display Serif (`--font-serif`):** `Playfair Display` (Italic, 600/700 weight) — used for oversized hero titles (`clamp(3.25rem, 7vw, 6.5rem)`, `tracking-tight`, `leading-[0.95]`) and section headers.
- **Script Accent (`--font-script`):** `Caveat` or `Satisfy` (400 weight) — used for small warm gold/saffron subheadings above display titles (e.g., *"Original Wood-Fired Flavor"*).
- **Body & UI Sans (`--font-sans`):** `Plus Jakarta Sans` (400/500/600 weight) — used for pill nav links, descriptions, prices, and interactive controls.

## 3. Signature Structural Elements
- **Navbar:** Centered `PizzaHut` wordmark flanked symmetrically by `rounded-full border border-border` pill links (`text-xs uppercase tracking-widest`), theme switcher, and cart badge trigger.
- **Hero Stage:** Central floating pizza slice/pie cutout surrounded by 4–6 independent mid-air ingredient layers (basil leaves, cherry tomatoes, olives) animated with Framer Motion mouse/scroll parallax, grounded by a smooth curved bottom arch divider (`<svg>` wave/arch transitioning from `bg-background` to `bg-card`).
- **Menu Cards:** Borderless or hairline-bordered containers where circular transparent-PNG pizzas overlap the top edge (`-mt-12`) to break rigid card boundaries.
