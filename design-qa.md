# Everyday features design QA

Date: 2026-09-07. Scope: local `sloth-site` homepage on
`codex/everyday-features`. No commit, push or deployment.

## Source and decision

The approved four-group layout remains. The user rejected the generated app
illustrations; all four have now been replaced with direct captures of actual
`sloth-budget` components. Source files, preview routes, fixture states and crop
coordinates are recorded in `docs/everyday-features.md`. No app component code or
fixture was edited. A later user-directed refinement hides only the tracking
summary icon during capture and uses the narrower native goal layout. The actual components take precedence over the generated
mockup's invented controls, progress bars, colours and goal icons.

The captures show TransactionCard, MTDSpendChart category rings,
ShareRatioSlider with TransactionModal's calculated amounts, and GoalRow.
They retain native component layout and text. The overview is decorative static
imagery; its controls are not interactive on the landing page. All feature
claims remain accessible in the accompanying HTML lists.

## Browser evidence

Verified URL: `http://127.0.0.1:4318/?review=real-components-final#everyday-features`.
PID 6378 serves this exact checkout, confirmed through its working directory.
Fresh navigation and cache-busted URLs were used after replacing the assets.

Screenshot directory:
`/Users/rathbala/.codex/visualizations/2026/09/06/01a077b4-881a-7f81-93df-ad538b238644/real-components/`

- `desktop-context.png`: the dashboard-to-overview transition.
- `desktop.png`: complete feature group overview.
- `mobile-tracking.png`, `mobile-budgeting.png`, `mobile-sharing.png`,
  `mobile-planning.png`: every mobile group, including adjacent boundaries.
- `tracking-source.png`, `budgeting-source.png`, `sharing-source.png`,
  `planning-source.png`: original real-component capture surfaces, outside Git.

Desktop checked at 1440px and mobile at 390px CSS viewport widths. The in-app
browser reserves a scrollbar gutter. Source PNGs and final browser composition
were visually inspected. Real captures intentionally vary in height; equal image
slots keep desktop titles aligned. No stretching, collisions or clipped benefit
copy was observed. Small labels within captures are supporting detail; the
site-standard 18px mobile / 22px desktop lists communicate every capability.

The eight-viewport browser regression additionally verifies 1/2/4 columns,
image-to-heading-to-list order, heading alignment, aspect ratios, at least 2x
image density, the light section surface and the existing advanced section's
light copy. WebP delivery totals 103,190 bytes, below the 120,000-byte budget.

## Requirement closure

| Requirement                                     | Status                 | Evidence                                                                      |
| ----------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------- |
| Use actual app components                       | Implemented            | Four direct preview captures; provenance in `docs/everyday-features.md`.      |
| Consolidate extra features                      | Implemented            | Four lists with sixteen benefits in initial HTML; `yarn check:copy`.          |
| Match the landing page bullet style             | Implemented            | Existing Lucide diamonds; desktop/mobile review.                              |
| Clear heading                                   | Implemented            | “Track, budget and save together”.                                            |
| Preserve approved grouping and surrounding page | Implemented            | Four-column overview and existing dark advanced section retained.             |
| Responsive, lightweight assets                  | Implemented            | Eight viewport checks, 2x density, preserved proportions and transfer budget. |
| Prevent another invented product depiction      | Implemented            | `docs/visual-assets.md` now requires canonical component captures.            |
| Publish to production                           | Intentionally deferred | Local implementation only; shipping was not requested.                        |

## Verification

Successful: `yarn check:copy`, `yarn check:home-visibility`, `yarn build`
(including public-site readiness), `yarn typecheck`, `yarn check:tracking`,
`yarn lint`, and `git diff --check`. Readable generated CSS restored using the
repository's documented Tailwind command.

Known unrelated limitation from earlier verification: `yarn check:typography`
reports 14px mobile text in the existing CLI example. The 0.875rem rule predates
this change. The new section's type-size assertions pass independently.

No new controls, keyboard shortcuts, persistence, analytics or operational logs.
Only the marketing site is changed; app UI, APIs, CLI, SDKs, jobs and stored data
remain unchanged and compatible. No app deployment or migration is required.

## Browser comment refinements

- **Comment 1 implemented:** standalone transaction category summary hidden with
  capture-only CSS; personal and joint category icons remain visible. Source
  capture assertions verified all three visibility states.
- **Comment 2 implemented:** goal recaptured at the app's native 390px viewport,
  producing a taller component without stretching or changing its contents.
- The previous checks covered equal slots and aligned headings, which allowed a
  visibly shorter goal image to pass. The new regression checks the actual image
  height against its neighbours and adds the exact 1200 × 479 review viewport.
  It failed on the old goal asset before passing on the new one.

Fresh screenshots in the task's `real-components-refined` directory:
`comments-tracking.png` and `comments-planning.png` reproduce the two comment
views at 1200 × 479; `desktop-overview.png` shows the whole overview at
1440 × 1131; `mobile-tracking.png` and `mobile-planning.png` show both changed
components and their lists at 390 × 844. The existing preview process still
serves this worktree on port 4318. Source application preview was stopped after
capture; no temporary wrapper or capture script was added to either repository.

## Tracking padding correction

The visibility-only icon omission retained a 48px grid column plus a 12px gap.
Removing that column in capture-only CSS restores the native 13px content inset;
both split icons remain visible and text stays 12px clear of the amount column.
The old capture failed the inset assertion (73px); the corrected capture passes
(13px). The exact CSS and required geometry checks are documented in
`docs/everyday-features.md` so future recaptures do not repeat this omission.

Fresh evidence: `tracking-padding/desktop.png` at 1200 × 479 and
`tracking-padding/mobile.png` at 390 × 844. Both show the corrected full card
inside the homepage, with adjacent heading and benefits. No app code changed.
