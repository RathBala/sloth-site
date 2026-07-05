# Meta Pixel (disabled)

Meta Pixel is currently disabled on the marketing site. The public pages do not
load `meta-pixel-config.js`, `meta-pixel-analytics.js`, or
`connect.facebook.net`, and `yarn build` no longer generates Meta config.

The old generator and analytics bundle remain in the repo only as a re-enable
path for future paid acquisition. Do not add the script tags back unless the
site also has marketing-cookie consent in place.

## Current behavior

| Surface                  | Behavior                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| Marketing site page load | No Meta `PageView` or `ViewContent` event.                            |
| Signup CTA click         | No Meta `Lead` event. PostHog still captures the CTA when configured. |
| Budget app signup        | No Meta `CompleteRegistration` event.                                 |

## Re-enable checklist

1. Add a marketing-consent category that is shared across
   `slothmoney.app` and `budget.slothmoney.app`.
2. Load Meta only after marketing consent is granted.
3. Restore the marketing-site script tags and config generation.
4. Re-enable the budget-app Pixel implementation in `sloth-budget`.
5. Update this doc, `docs/paid-social-tracking.md`, and the privacy policy.

## Related

- [Tracking inventory](./tracking-inventory.md) - cross-provider source of truth for marketing-site tracking posture.
- [PostHog](./posthog.md) - active analytics and CTA attribution.
- [Paid social tracking runbook](./paid-social-tracking.md) - currently paused
  while Meta Pixel is disabled.
