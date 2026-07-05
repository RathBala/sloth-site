# Paid Social Tracking Runbook (paused)

Paid social tracking is currently paused because Meta Pixel is disabled on both
the marketing site and the budget app.

## Active tracking

| Step              | System  | Event                                        |
| ----------------- | ------- | -------------------------------------------- |
| Landing page load | PostHog | `landing_view` plus pageview when configured |
| Signup CTA click  | PostHog | `cta_clicked`                                |
| App signup        | PostHog | `signup_completed`                           |

The landing page still rewrites tracked CTA links to
`https://budget.slothmoney.app` with UTM and CTA context so PostHog can preserve
campaign context.

## Disabled tracking

| Surface             | Disabled event                    |
| ------------------- | --------------------------------- |
| Marketing site load | Meta `PageView` and `ViewContent` |
| Signup CTA click    | Meta `Lead`                       |
| Budget app load     | Meta `PageView`                   |
| App signup          | Meta `CompleteRegistration`       |

## Re-enable checklist

Before launching paid social traffic that depends on Meta attribution:

1. Add marketing-cookie consent across `slothmoney.app` and
   `budget.slothmoney.app`.
2. Re-enable Meta Pixel on the marketing site after consent.
3. Re-enable Meta Pixel on the budget app after consent.
4. Smoke-test Meta Events Manager with a disposable campaign and test signup.
5. Update [meta-pixel.md](./meta-pixel.md) and the privacy policy.

## Previous verification

On May 26, 2026, the old Meta Pixel flow was verified with Pixel ID
`848918190793915`. That configuration is no longer active.
