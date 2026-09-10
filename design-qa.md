# Home planner mobile estimate dock

final result: passed

## Visual target and evidence

- Selected target: first displayed concept, **Estimate dock**.
- Source visual: `/Users/rathbala/.codex/generated_images/01a08ca1-fad0-7ab0-8759-9a8611621945/exec-26f3b6f4-9e30-4f3e-84ba-3476fb72003f.png` (1305 × 1206 concept board with two mobile states).
- Local implementation: `http://127.0.0.1:4317/home-planner/#plan`, served from this worktree. No production deployment.
- Capture directory: `/Users/rathbala/.codex/visualizations/2026/09/10/01a08ca1-fad0-7ab0-8759-9a8611621945/`.
- `mobile-results.png` and `mobile-sheet.png`: 390 × 844 CSS pixels and image pixels, device scale 1. Source board and both implementation images were inspected together in one comparison input. Compare each source panel independently of its board margins; the generated board is a layout reference, not a browser screenshot with an exact CSS viewport.
- Latest slider follow-up: `mobile-slider-steps.png` and `mobile-cost-steps.png` at 390 × 844; `desktop-slider-steps.png` at 1440 × 1000. These supersede the earlier control screenshots and show the requested precision changes. Deposit is £101,000 after one £1,000 increase from £100,000.
- `desktop-results.png` and `desktop-controls.png`: 1440 × 1000, first view and scrolled controls. The desktop controls remain inline.
- Screenshot workflow: after each reload or viewport change, allow the browser to apply it, then read `innerWidth`, `innerHeight` and device scale in a separate call before capturing. Browser zoom previously changed effective dimensions. Latest evidence confirms 390 × 844 and 1440 × 1000 at device scale 1. Reset the viewport only after the capture has completed.

## Findings and comparison history

1. First browser pass: the mobile header consumed too much height and the comfort warning extended below the dock. Fixed by reducing results-only header spacing, banner height and decorative badge size. Final warning ends at y689, while the dock begins at y744 on the 390 × 844 viewport.
2. First sheet pass: interest rate and term only had sliders. Added exact numeric entry alongside both sliders to match the selected editor. The initial design fit all four primary controls. The requested precision follow-up adds 44px minus/plus buttons, so the term control now scrolls into view; the pinned footer remains at y762 on a 390 × 844 viewport.
3. Final comparison: no remaining blocking findings. The estimate, deposit needed, Cancel and Apply remain visible while the inputs scroll. Scrolling additional controls preserves the sheet header and footer. Native modal layering blocks background interaction.

4. Slider sensitivity follow-up: continuous deposit percentages could produce £37,037 while dragging. Deposit now snaps to whole £1,000 cash amounts, with exact typed amounts preserved. Other controls retain their established domain increments and gain single-step buttons. Regression checks cover dragging, arrow keys, buttons, exact entry and deposit boundaries.
5. Focus inspection exposed native scrolling of the outer dialog, which clipped its header. The dialog now uses `overflow: clip`; only `#plan-sheet-controls` scrolls. Chromium and WebKit regression checks prove the outer dialog stays at scroll position zero.
6. Latest mobile layout measurement: deposit buttons are 44 × 44px at x21 and x325; the range spans x77–313. Both buttons share the same vertical position and neither overlaps the range. Desktop and scrolled mobile screenshots were also inspected; no remaining clipping within controls.

7. Controls-only follow-up: the user identified the balance projections inside the editor. The balance table and rate-impact example now live in one results card outside the movable mortgage-controls section on both mobile and desktop. Short option explanations and payment/consequence summaries stay beside the choices they explain. Browser regressions assert that no projection block enters the sheet, that draft edits leave applied projections unchanged, and that Apply updates them. Previous checks verified that all controls moved but did not constrain non-control content.
8. Latest scope screenshots: `mobile-controls-only.png` shows the sheet ending at Fixed/Tracker; `mobile-balance-results.png` and `desktop-balance-results.png` show the retained projections on the page. These supersede earlier evidence for the bottom of the sheet. Final captures use an isolated Playwright Chromium context with the installed Chrome channel, device scale 1 and reduced motion, against the verified current-worktree server at port 4317. The in-app browser had persistent 120% zoom that distorted its screenshots. The same £1m home, £400,000 deposit and 4.5% rate reproduce the user's screenshot values.

## Fidelity surfaces

- **Typography:** existing Manrope, dark-green headings and bold financial values retained. Numeric fields use native number inputs, so they omit thousands separators while editing; the preview and results remain currency-formatted.
- **Spacing:** fixed estimate/action dock and tall rounded sheet follow the selected structure. Existing breakdown navigation and explanatory content are retained, so the results page shows less breakdown content in its first viewport than the illustrative concept. Comfortable single-step touch targets take priority over fitting every core control into the first sheet viewport. The controls scroll beneath the fixed preview and above Apply.
- **Colour:** existing planner semantic tokens own ivory surfaces, pale-mint previews, forest-green actions and peach budget warnings. No new styling framework.
- **Assets:** existing compressed woodland artwork, tan sloth logo and Lucide icons reused. No generated raster assets ship with this change.
- **Content:** actual calculator results remain authoritative, including a £4,831 mortgage for the £1m example rather than the concept's rounded £4,832. All existing cost and mortgage choices remain available. The decorative drag handle is omitted because this version opens and closes through explicit buttons, not dragging.

Full-view images have readable controls at 1×; DOM measurements above provide focused boundary evidence without an additional enlarged crop.

## Requirement closure

| Requirement                                       | Status                  | Evidence                                                                                                                              |
| ------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Persistent mobile estimate and Adjust plan action | Implemented             | `.plan-dock`, mobile results screenshot, arrival regression                                                                           |
| Tall sheet with all existing adjustment controls  | Implemented             | `home-planner-sheet.js` moves the original assumption and mortgage sections; primary and scrolled screenshots                         |
| Live draft estimate and upfront deposit           | Implemented             | Existing `calculateHomePlan` feeds the sheet preview; draft test keeps applied results unchanged                                      |
| Apply / Cancel / Escape                           | Implemented             | Browser regression checks applied deposit, draft discard, invalid input and focus restoration                                         |
| Numeric deposit, rate and term entry              | Implemented             | Shared controls and existing calculator; exact-entry and shared-ownership regressions                                                 |
| Preserve desktop controls                         | Implemented             | Responsive resize regression and desktop controls screenshot                                                                          |
| Lock background scrolling and contain focus       | Implemented             | Wheel, Tab, Escape, simulated keyboard viewport and restored-scroll tests in Chromium and WebKit                                      |
| Predictable slider increments                     | Implemented             | `home-planner-sliders.js`, field-specific snapping/nudging in `home-planner.js`, browser increment/limit tests and latest screenshots |
| Controls and detailed projections separated       | Implemented             | Projections live in `.plan-panel`; `home-planner-sheet-check.mjs` guards location and Apply boundary                                  |
| Private temporary values                          | Implemented             | No persistence or remote writes; existing refresh-clears-data regression retained                                                     |
| Public route and tracking compatibility           | Unchanged intentionally | Build/public-site and tracking checks pass; no endpoint, policy or event changes                                                      |

## Verification and scope

- `yarn check:home-planner`: passed (calculator tests and Chromium interaction checks, including 320/390/430px overflow checks).
- `HOME_PLANNER_BROWSER=webkit yarn check:home-planner`: passed.
- `yarn build`: passed, including public-site readiness, repository hygiene and developer documentation/release checks.
- `yarn lint`, `yarn typecheck`, `yarn check:tracking`: passed.
- Final in-app browser console error inspection: none.
- Generated CSS restored with the documented non-minified Tailwind command after the production build.
- Human UI owner: `sloth-site`; local changes only. Backend, agent API, CLI, SDK, jobs, storage and sibling `sloth-budget` are unaffected; no release ordering or data migration required.
- Keyboard: native form controls, contained Tab navigation, Escape cancellation and trigger focus restoration. No new shortcut grammar is warranted.
- Operational logging: unchanged; this synchronous local calculation has no new service failure to diagnose. Product analytics: unchanged; existing completion/signup funnel remains, and discovery of the new action is evaluated through the current usability review before adding any new event. Tracking inventory reviewed, unchanged.

The keyboard layout uses the browser visual viewport, which can shrink independently of the document when the keyboard opens ([MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport)). A browser regression simulates that viewport change and checks the actual footer position.

## Review workflow

When reusing a section inside an editor, inventory its inputs, contextual choice help and result-only content before moving it. Verify both what the editor includes and what it excludes; screenshots of the top controls alone cannot establish this boundary. For repeatable screenshots, prefer an isolated Playwright context when in-app zoom changes measured or captured dimensions. Reuse the repository browser-launch fallback (`channel: chrome` when the bundled Chromium executable is absent) rather than assuming a downloaded browser is available.

## Remaining limits

Responsive browser and WebKit tests do not replace a physical-phone keyboard check. No remote save, drag-to-dismiss interaction, deployment or production verification is included.
