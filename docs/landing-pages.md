# Campaign landing pages

This repo uses static HTML under `src/`. The main marketing site lives in [`src/index.html`](../src/index.html).

## Wedding fund (paid social)

- **URL:** `https://slothmoney.app/wedding-fund/` (Netlify serves [`src/wedding-fund/index.html`](../src/wedding-fund/index.html))
- **Purpose:** Cold paid-social traffic for couples saving for a wedding. Narrow message: one shared wedding fund plan, one primary CTA (`Start planning together`) to the budget app.
- **Layout:** The header and hero mirror [`src/index.html`](../src/index.html) (gems graphic, hero container width, typography scale, green primary + text “Sign in” row, `rounded-lg` hero CTA). Wedding-specific copy is in the headline and body only; header CTAs stay “Sign in” / “Start for free” like the main site.
- **Attribution:** Budget-app links use `data-analytics-cta` values prefixed with `wedding-` (for example `wedding-hero-primary`, `wedding-header-start`). [`posthog-analytics.js`](../src/assets/js/posthog-analytics.js) augments `budget.slothmoney.app` URLs with UTM and entry metadata.
- **Hero visual:** Uses the same hero asset as the main site ([`src/index.html`](../src/index.html) - `hero asset.png` / `hero asset mobile.png`). You can swap in a wedding-specific crop later if you want tighter ad-to-page message match.
- **Feature imagery:** The body reuses the same product screenshots as the homepage features (`benefit one` through `benefit four`, desktop + mobile), in sections “A wedding fund plan you can actually act on” and “Built for real wedding planning…”. Swap paths if Sloth Budget ships wedding-labelled shots later.

## Running locally

From the repo root, `yarn dev` serves `src` at port 3000. Open `/wedding-fund/` (with trailing slash) in the dev server.

## Build

`yarn build` regenerates PostHog/Meta config and compiles Tailwind to `src/output.css`. Deploy the `src` directory (see [`netlify.toml`](../netlify.toml)).
