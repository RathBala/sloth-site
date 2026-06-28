# Campaign landing pages

This repo uses static HTML under `src/`. The main marketing site lives in [`src/index.html`](../src/index.html).

On the homepage, **`Your data, fully under your control`** (data and privacy cards) appears **after** the **`Invest in your future, together`** pricing block and before the closing CTA (`#waitlist`).

## Homepage archetype flow

The homepage saver cards stay intentionally light: **Solo** links straight to the budget app, while **Couple** scrolls to the on-page couple branch (`#couple-archetypes`). That image-led branch offers **Planner + Free Spirit**, **Planner + Planner**, and **Free Spirit + Free Spirit** as tracked paths. The lower homepage content stays present in the normal page flow as a dimmed preview for crawlability and no-JS access. Selecting a couple path updates the URL hash, for example `#planner-free-spirit-content`, undims the content in place, and swaps the below-gate copy so the path intro, feature rows, example cards, and pricing CTA speak to that couple dynamic. All variant copy remains in static `data-archetype-*` attributes for crawlers and no-JS inspection. The selection is URL-derived only; it is not stored locally or remotely and does not claim personality-specific onboarding inside `sloth-budget`.

## Wedding fund (paid social)

- **URL:** `https://slothmoney.app/wedding-fund/` (Netlify serves [`src/wedding-fund/index.html`](../src/wedding-fund/index.html))
- **Purpose:** Cold paid-social traffic for couples saving for a wedding. Narrow message: one shared wedding fund plan, one primary CTA (`Start planning together`) to the budget app.
- **Layout:** The header and hero mirror [`src/index.html`](../src/index.html) (gems graphic, hero container width, typography scale, green primary + text “Sign in” row, `rounded-lg` hero CTA). Wedding-specific copy is in the headline and body only; header CTAs stay “Sign in” / “Start for free” like the main site. There is no separate “How it works” section - the **Built for…** feature block is the main product narrative.
- **Attribution:** Budget-app links use `data-analytics-cta` values prefixed with `wedding-` (for example `wedding-hero-primary`, `wedding-header-start`). [`posthog-analytics.js`](../src/assets/js/posthog-analytics.js) augments `budget.slothmoney.app` URLs with UTM and entry metadata.
- **Hero visual:** Uses the same hero asset as the main site ([`src/index.html`](../src/index.html) - `hero asset.png` / `hero asset mobile.png`). You can swap in a wedding-specific crop later if you want tighter ad-to-page message match.
- **Feature imagery:** The main product block is **`Built for real wedding planning, not spreadsheet juggling`** (alternating text/image placement on large screens: odd rows text-left, even rows image-left, via `lg:order-1` / `lg:order-2` like [`src/index.html`](../src/index.html)). Four rows: goal/timeline/monthly amounts [`wedding-goal-outcomes.png`](../src/assets/images/wedding-goal-outcomes.png) (sm+ viewport) and [`wedding-goal-outcomes-mobile.png`](../src/assets/images/wedding-goal-outcomes-mobile.png) (narrow / same picture element pattern as homepage `benefit one`), month-to-month budget `benefit three`, scenario timelines `benefit four`, shared alignment `benefit two`, followed by the same **Start planning together** CTA as before (`data-analytics-cta="wedding-solution-cta"`). The first row uses wedding-specific stills from Sloth Budget (`yarn screenshot:wedding-benefit-one` → `wedding-benefit-one.png` + `wedding-benefit-one-mobile.png`); the remaining rows reuse homepage screenshots.
- **Web app (PWA):** After that block, the page includes the same **`Use it like an app - without the App Store`** section as [`src/index.html`](../src/index.html) (home screen, no App Store, same account everywhere), then FAQ, then pricing.
- **Trust:** **`Private, practical, and built for shared planning`** (encryption, read-only access, shared finances) sits **after** the pricing block and before the closing CTA.
- **Pricing:** The same pricing block as [`src/index.html`](../src/index.html) (monthly/yearly toggle via [`pricing-toggle.js`](../src/assets/js/pricing-toggle.js)) appears after the FAQ. The primary button in that block uses `data-analytics-cta="wedding-pricing-start"`. Trial-card copy matches the homepage and spells out that **one subscription covers both partners** (two accounts, one price) from signup.

## Developers

- **URL:** `https://slothmoney.app/developers/` (Netlify serves [`src/developers/index.html`](../src/developers/index.html))
- **Purpose:** Public, lightweight developer page for the Sloth Agent API beta. It explains how paid Sloth users can create a Developer access token, use the CLI, read categories/transactions, and apply category assignments.
- **Public boundary:** Keep this page focused on user-safe setup, examples, endpoint names, query options, and safety notes. Do not copy internal architecture details from `sloth-budget`, such as Firestore document paths, token hashing implementation, assignment side effects, or backend service names.
- **Primary CTA:** `Open Sloth Money`, pointing to `https://budget.slothmoney.app`. The page assumes token creation happens inside the app, not through public token-management API docs.
- **Canonical path:** `/developers/` is the public canonical page for now. A future `docs.slothmoney.app` or developer subdomain can redirect back here if the API surface grows into versioned docs.

## Running locally

From the repo root, `yarn dev` serves `src` at port 3000. Open `/wedding-fund/` (with trailing slash) in the dev server.

## Build

`yarn build` regenerates PostHog/Meta config and compiles Tailwind to `src/output.css`. Deploy the `src` directory (see [`netlify.toml`](../netlify.toml)).
