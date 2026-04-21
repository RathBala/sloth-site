# Campaign landing pages

This repo uses static HTML under `src/`. The main marketing site lives in [`src/index.html`](../src/index.html).

On the homepage, **`Your data, fully under your control`** (data and privacy cards) appears **after** the **`Invest in your future, together`** pricing block and before the closing CTA (`#waitlist`).

## Wedding fund (paid social)

- **URL:** `https://slothmoney.app/wedding-fund/` (Netlify serves [`src/wedding-fund/index.html`](../src/wedding-fund/index.html))
- **Purpose:** Cold paid-social traffic for couples saving for a wedding. Narrow message: one shared wedding fund plan, one primary CTA (`Start planning together`) to the budget app.
- **Layout:** The header and hero mirror [`src/index.html`](../src/index.html) (gems graphic, hero container width, typography scale, green primary + text “Sign in” row, `rounded-lg` hero CTA). Wedding-specific copy is in the headline and body only; header CTAs stay “Sign in” / “Start for free” like the main site. There is no separate “How it works” section - the **Built for…** feature block is the main product narrative.
- **Attribution:** Budget-app links use `data-analytics-cta` values prefixed with `wedding-` (for example `wedding-hero-primary`, `wedding-header-start`). [`posthog-analytics.js`](../src/assets/js/posthog-analytics.js) augments `budget.slothmoney.app` URLs with UTM and entry metadata.
- **Hero visual:** Uses the same hero asset as the main site ([`src/index.html`](../src/index.html) - `hero asset.png` / `hero asset mobile.png`). You can swap in a wedding-specific crop later if you want tighter ad-to-page message match.
- **Feature imagery:** The main product block is **`Built for real wedding planning, not spreadsheet juggling`** (alternating text/image placement on large screens: odd rows text-left, even rows image-left, via `lg:order-1` / `lg:order-2` like [`src/index.html`](../src/index.html)). Four rows: goal/timeline/monthly amounts `benefit one`, month-to-month budget `benefit three`, scenario timelines `benefit four`, shared alignment `benefit two`, desktop + mobile), followed by the same **Start planning together** CTA as before (`data-analytics-cta="wedding-solution-cta"`). It reuses homepage screenshots; swap paths if Sloth Budget ships wedding-labelled shots later.
- **Web app (PWA):** After that block, the page includes the same **`Use it like an app - without the App Store`** section as [`src/index.html`](../src/index.html) (home screen, no App Store, same account everywhere), then FAQ, then pricing.
- **Trust:** **`Private, practical, and built for shared planning`** (encryption, read-only access, shared finances) sits **after** the pricing block and before the closing CTA.
- **Pricing:** The same pricing block as [`src/index.html`](../src/index.html) (monthly/yearly toggle via [`pricing-toggle.js`](../src/assets/js/pricing-toggle.js)) appears after the FAQ. The primary button in that block uses `data-analytics-cta="wedding-pricing-start"`. Trial-card copy matches the homepage and spells out that **one subscription covers both partners** (two accounts, one price) from signup.

## Running locally

From the repo root, `yarn dev` serves `src` at port 3000. Open `/wedding-fund/` (with trailing slash) in the dev server.

## Build

`yarn build` regenerates PostHog/Meta config and compiles Tailwind to `src/output.css`. Deploy the `src` directory (see [`netlify.toml`](../netlify.toml)).
