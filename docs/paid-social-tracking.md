# Paid Social Tracking Runbook

Use this before and after launching paid social traffic to `slothmoney.app`.

## What Should Be Tracked

Expected funnel:

| Step              | System     | Event                                     |
| ----------------- | ---------- | ----------------------------------------- |
| Landing page load | Meta Pixel | `PageView`, `ViewContent`                 |
| Landing page load | PostHog    | `landing_view` plus autocaptured pageview |
| Signup CTA click  | Meta Pixel | `Lead`                                    |
| Signup CTA click  | PostHog    | `cta_clicked`                             |
| App load          | Meta Pixel | `PageView` on `budget.slothmoney.app`     |
| App signup        | PostHog    | `signup_completed`                        |
| App signup        | Meta Pixel | `CompleteRegistration`                    |

`Lead` is a click-through event. `CompleteRegistration` is the completed-account event that Meta should use for signup attribution and optimization.

## Required Production Config

Marketing site (`sloth-site`):

| Variable           | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `META_PIXEL_ID`    | Numeric Meta Pixel ID used by the landing page |
| `POSTHOG_API_KEY`  | Browser PostHog project key                    |
| `POSTHOG_API_HOST` | Optional PostHog ingest host; defaults to EU   |

Budget app (`sloth-budget`):

| Variable             | Purpose                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `VITE_META_PIXEL_ID` | Must match `META_PIXEL_ID` from `sloth-site`                                   |
| `VITE_POSTHOG_KEY`   | Should use the same PostHog project as the marketing site for stitched funnels |
| `VITE_POSTHOG_HOST`  | Optional PostHog ingest host; keep aligned with the marketing site             |

The Pixel ID verified during the May 26, 2026 smoke test was `848918190793915`.

## Attribution Handoff

The landing page rewrites tracked CTA links to `https://budget.slothmoney.app` with these params:

| Param                                                      | Source / meaning                        |
| ---------------------------------------------------------- | --------------------------------------- |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`  | Current landing URL                     |
| `creative_id`, `pain_angle`, `audience`, `landing_variant` | Current landing URL                     |
| `entry_point`                                              | CTA placement, for example `hero-start` |
| `intent`                                                   | `signup` or `signin`                    |
| `cta_id`                                                   | Same value as `entry_point`             |

The budget app stores these values as first-touch attribution in `sessionStorage` and attaches them to PostHog events. Meta `CompleteRegistration` includes the stored UTM fields.

## Smoke-Test URL

Use a disposable campaign name so test traffic is easy to filter:

```text
https://slothmoney.app/?utm_source=meta&utm_medium=paid_social&utm_campaign=codex_smoke&utm_content=test_creative&creative_id=creative_smoke&pain_angle=catch_up&audience=couples&landing_variant=home
```

## Smoke-Test Steps

1. Open the smoke-test URL in a fresh browser session.
2. Confirm the landing page loads and Meta Events Manager Test Events shows `PageView` and `ViewContent`.
3. Click a signup CTA, preferably the hero CTA.
4. Confirm the app URL includes UTM params plus `entry_point`, `intent=signup`, and `cta_id`.
5. Complete a test signup with a disposable email address.
6. In Meta Events Manager Test Events, confirm `Lead` from `slothmoney.app` and `CompleteRegistration` from `budget.slothmoney.app`.
7. In PostHog, confirm `landing_view`, `cta_clicked`, and `signup_completed`; break down by `utm_campaign` or `entry_point`.
8. Delete the disposable test user from Firebase if needed.

## Known Browser Caveat

In Playwright / Chromium network logs, Facebook Pixel trigger requests can show `net::ERR_BLOCKED_BY_ORB` even when the event is initiated with the correct Pixel ID and appears in Meta Events Manager. Treat Meta Events Manager Test Events as the source of truth for delivery.

## Last Verified

May 26, 2026:

- Marketing site Pixel ID: `848918190793915`.
- Budget app production bundle contained the same Pixel ID and `CompleteRegistration` event code.
- Live UTM handoff stored attribution in the budget app.
- Test signup emitted `CompleteRegistration` from `budget.slothmoney.app`.
- Meta Events Manager confirmed the test event.
