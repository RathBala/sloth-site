# Everyday homepage features

The homepage's `#everyday-features` section sits between the dashboard and the
four detailed product features. It is static, searchable HTML: four task groups,
sixteen diamond bullets, and four decorative app component captures. There are no new
controls, requests, saved values, routes, or keyboard shortcuts.

## Product evidence

Canonical product owner: the sibling `sloth-budget` repository. Recheck these
sources when changing a claim or illustration; a generated mockup is not evidence
that a feature exists.

| Group                | Product evidence in `sloth-budget`                                                                                                                                            | Captured component                                                                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Track every purchase | `src/pages/TransactionsPage.tsx`, `src/components/CsvTransactionImportWizard.tsx`, `docs/features/transaction-split-categorization.md`, `docs/features/receipt-evidence.md`   | `src/components/TransactionCard.tsx`: Tesco purchase, separate personal/joint categories and shared expense status.                                                                                                           |
| Budget your way      | `src/pages/BudgetPage.tsx`, `src/components/SetTargetModal.tsx`, `src/components/settings/BudgetPeriodSettingsSection.tsx`, `docs/features/transaction-notification-rules.md` | `src/components/MTDSpendChart.tsx`: actual category rings and remaining amounts. Alerts remain user-configured rules, not automatic subscription discovery.                                                                   |
| Share fairly         | `src/components/ShareRatioSlider.tsx`, `src/pages/PartnerPage.tsx`, `docs/features/transaction-explanation-links.md`                                                          | `ShareRatioSlider` and the adjacent calculated share cards in `src/components/TransactionModal.tsx`.                                                                                                                          |
| Plan what's next     | `docs/features/savings-investments-plan.md`, `docs/features/goal-outcomes-ui-notes.md`                                                                                        | `src/components/GoalRow.tsx`, rendered by `GoalOutcomesListView` in `src/components/GoalOutcomesList.tsx`: Wedding Fund, saved amount, estimated funding date and target. No implied automatic transfers or guaranteed dates. |

## Capture provenance

Captured 2026-09-07 from `/Users/rathbala/Code/sloth-budget`, commit
`cd55a2274032aa38fbdd17b79598e8bf6c7d85c2`. The existing preview components and
fixtures were not edited. The preview ran with
`SLOTH_PREVIEW_FRONTEND_PORT=5276 yarn dev:e2e:preview`; it needs no sign-in and
does not load live financial data.

The budgeting and sharing captures use a same-origin iframe at 2x CSS scale.
The refined tracking capture uses a direct 465px preview viewport at 2x device
density; planning uses the real 390px responsive layout at 3x device density.
No application source or fixture was edited.

For tracking only, the user requested removing the standalone category icon
and its reserved column while keeping the personal and joint split icons.
Capture-only CSS removes that column and updates the remaining grid positions:

```css
[data-testid='transaction-card'] {
  grid-template-columns: minmax(0, 1fr) auto !important;
}
[data-testid='transaction-card-category-column'] {
  display: none !important;
}
[data-testid='transaction-card-category-column'] + div {
  grid-column: 1 !important;
}
[data-testid='transaction-card-amount'] {
  grid-column: 2 !important;
}
[data-testid='transaction-card-partner-actions'] {
  grid-column: 1 / span 2 !important;
}
```

Capture checks must compare the content's left edge with the card's native
padding plus border (13 CSS pixels at this viewport), verify both split controls
are visible, and confirm the content's right edge does not overlap the amount.
The original visibility-only version failed this inset check at 73px; the
collapsed-column capture passes at 13px. Hiding a node alone is insufficient
when a grid track still reserves its space. Do not change the application source.
Planning uses the unmodified responsive GoalRow, with badges below its name.

| Asset     | Preview route / state                                                                                                              | Capture                                                                   | Export / quality      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------- |
| tracking  | `/__preview/transaction-card`, first Tesco card                                                                                    | Full component, 465px viewport at 2x; summary column removed as requested | 866 × 650, quality 92 |
| budgeting | `/__preview/dashboard-marketing`, `mtd-category-grid`; outer frame offset 545px                                                    | Source crop `(60, 44, 776, 530)`                                          | 776 × 530, quality 86 |
| sharing   | `/__preview/transaction-card?drawer=toggle`; Split with partner → Share → two right-arrow steps from 50%, outer frame offset 600px | Source crop `(922, 46, 796, 522)`                                         | 796 × 522, quality 88 |
| planning  | `/__preview/goal-outcomes?goalId=`, first Wedding Fund row                                                                         | Full component, 390px viewport at 3x                                      | 924 × 636, quality 88 |

Source PNGs are outside Git in the task's `real-components` visualization folder,
with the latest tracking source in `tracking-padding` and the planning source
in `real-components-refined`.
Export with `cwebp -q <quality> -m 6 -sharp_yuv -metadata none <source> -o <asset>`;
add the listed `-crop <x> <y> <width> <height>` for the two original captures.
No generated pixels, rewritten values or composed controls are used. The
sharing preview calculates £19.10 + £12.74 = £31.84 from its real 60/40 control.
No save is needed.

The approved concept's “Ask your partner via WhatsApp” was changed to “Ask your
partner about a purchase.” The product uses native sharing or copy; it does not
send WhatsApp messages directly. Source review confirms implemented capabilities,
not the deployment health of the separate app and notification runtimes.

## Rendering and delivery

`src/index.html` owns the copy and list structure. Tailwind owns the existing
spacing, brand colours and icons; `src/assets/css/site-typography.css` owns body
type. `src/assets/css/everyday-features.css` owns this section's grid, mint surface,
dividers and image slots. The compact group titles use the existing 24px card
title size; body text remains 18px below 1024px and 22px above it.

The layout uses one column below 640px, two below 1280px, and four at larger sizes.
Images keep their proportions and render at no more than 380 CSS pixels wide.
They are lazy-loaded WebP files with metadata removed. Their combined
103,190-byte payload has a 120,000-byte regression budget in
`scripts/check-home-visibility.mjs`. They are below the hero, so none is preloaded.
The HTML conveys all capabilities without images or JavaScript.

The existing advanced section retains its dark styling. Its selector now names
`data-advanced-features` explicitly instead of styling whichever section comes
first. No existing section has been recoloured to match the generated mockup's
inaccurate surrounding context.

## Verification and scope

- `yarn check:copy`: placement, initial HTML content, sixteen consolidated diamond
  bullets, and no invented controls or extra CTA.
- `yarn check:home-visibility`: responsive columns, non-overlap, aligned desktop
  titles, readable type, image proportions, comparable goal image height, 2x density, light surface and payload.
- `yarn build`: public route/metadata/discovery checks and deploy CSS generation.
- `design-qa.md`: source comparison and desktop/mobile evidence.

Only `sloth-site` presentation, assets and checks change. App UI, backend, Agent
API, CLI, SDK, jobs and persistence in `sloth-budget` remain compatible and
unchanged. No migration or separate app release is required by this site change.
This work is local until committed and deployed through the site's normal flow.

Operational logging is unchanged because no new runtime operation is added.
Product analytics is unchanged: existing `landing_view` and `cta_clicked` events
measure landing visits progressing to signup intent. This is sufficient for
monitoring the overall funnel, but does not isolate the section's causal effect.
`docs/tracking-inventory.md` was reviewed; its fields and purposes remain accurate.

## Local review

From this checkout, run `python3 -m http.server 4318 --bind 127.0.0.1 --directory src`
and open `http://127.0.0.1:4318/#everyday-features`. No sign-in is needed. Stop with
Ctrl+C. Inspect 390px mobile, 640px tablet, and 1331px/1440px desktop widths; check
the dashboard-to-section transition and the following advanced feature section.
