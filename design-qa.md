# Home planner tracker and closing CTA design QA

- source visual truth paths: `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-945cb916-b427-499b-ac52-5da9c518bb2f.png` and `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-abb99511-add9-4651-ab21-7a303757ca90.png`
- implementation screenshot paths: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-tracker-impact-desktop.png` and `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-full-width-cta-desktop.png`
- responsive screenshot paths: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-tracker-impact-mobile.png` and `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-full-width-cta-mobile.png`
- viewport: desktop `1440 × 1024` CSS pixels; mobile `390 × 844`
- state: £300,000 home, 10% deposit, £270,000 mortgage, 5.0% assumed rate, 30-year term, repayment selected, Tracker selected, sources expanded
- combined comparison evidence: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-tracker-comparison.png` and `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-cta-comparison.png`

## Findings

No actionable P0, P1, or P2 differences remain.

- Tracker feedback: the selected Tracker state now pairs the segmented control with a high-salience worked illustration. It shows the monthly payment at one percentage point above the user's assumed rate, followed by the short explanation that a tracker payment can rise or fall. The current-rate plan remains unchanged, so the illustration does not imply that the tool knows a future lender benchmark or margin.
- Closing hierarchy: the signup CTA now occupies its own full-width row after the lever column and the complete plan column, including the planning disclaimer and expanded sources. It spans the whole results workspace to the right of the fixed artwork.
- Spacing and alignment: desktop measurements confirm that the CTA's left and right edges match the results grid exactly. It begins below both the lever panel and the expanded sources. Mobile preserves the same reading order with equal content widths and no horizontal overflow.
- Colors and visual tokens: the new rate illustration uses the existing soft surface, ink, muted text and border system. The CTA keeps the existing dark-green conversion treatment. No new color family or one-off accent was introduced.
- Typography and copy: the illustration is concise enough to scan next to the mortgage setup without competing with the payment cards. CTA copy is unchanged and remains the final conversion message after the planning evidence.
- Image quality and asset fidelity: the fixed optimized home-planner artwork and existing Lucide icon set remain unchanged and sharp.

## Comparison history

1. The reference Tracker state changed only a low-contrast helper sentence, so the control appeared inert. The implementation adds a concrete `+1 percentage point example` row with the corresponding monthly payment and rate.
2. The reference CTA sat inside the plan column before the disclaimer and sources. The implementation moves it after the complete two-column results grid and spans both result columns.
3. Desktop and mobile captures confirm that the new placement does not create overflow, clipping, or a competing scroll region.

## Interaction and responsive checks

- Fixed and Tracker remain native radio choices with Tab and arrow-key support plus visible focus styling. No additional keyboard shortcut is warranted for this short, one-off comparison.
- Tracker updates the worked illustration for Repayment, Interest-only, and Part-and-part because it reuses the selected mortgage method and all live lever values.
- Changing the interest rate, term, deposit, home price, or Part-and-part split immediately recalculates the Tracker illustration.
- The CTA stays below the expanded sources on desktop and mobile, and the desktop artwork remains fixed while the right content panel scrolls.
- Browser console errors checked: none from the planner implementation.

## Follow-up polish

No P3 follow-up is required for this iteration.

final result: passed

---

# Homepage hero design QA

## Findings

- No actionable P0, P1, or P2 findings remain.

## Source visual truth

- Gem/watering composition: `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-dfa6d627-897d-4bf7-b5c0-00020ab8b7de.png`
- Dashboard/background boundary: `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-673ee268-c2ed-49c4-89d2-29ab16ecbac8.png`
- Both supplied screenshots are `2832x1492` pixels. They were normalized to `1423x740` for the side-by-side comparisons.

## Implementation evidence

- Local URL: `http://localhost:3017/?v=tall-garden-final-desktop`
- Desktop fold: `/Users/rathbala/.codex/generated_images/01a04d40-9654-7e81-9a1f-e2bca5500275/hero-implementation/home-hero-tall-garden-desktop.jpg`
  - Browser viewport: `1438x748` CSS pixels.
  - Screenshot output: `1423x740` pixels.
  - State: homepage at `scrollY: 0`.
- Mobile fold: `/Users/rathbala/.codex/generated_images/01a04d40-9654-7e81-9a1f-e2bca5500275/hero-implementation/home-hero-tall-garden-mobile.jpg`
  - Browser viewport: `390x844` CSS pixels.
  - Screenshot output: `375x812` pixels.
  - State: homepage at `scrollY: 0`.
- Full dashboard and lower garden: `/Users/rathbala/.codex/generated_images/01a04d40-9654-7e81-9a1f-e2bca5500275/hero-implementation/home-dashboard-tall-garden.jpg`
  - Browser viewport: `1438x1000` CSS pixels.
  - Screenshot output: `1423x990` pixels.
  - State: homepage at `scrollY: 600`; the complete dashboard and leafy padding below it are visible.
- Full-view comparison: `/Users/rathbala/.codex/generated_images/01a04d40-9654-7e81-9a1f-e2bca5500275/hero-implementation/tall-garden-hero-before-after.jpg`
- Focused lower-boundary comparison: `/Users/rathbala/.codex/generated_images/01a04d40-9654-7e81-9a1f-e2bca5500275/hero-implementation/tall-garden-dashboard-before-after.jpg`

## Fidelity review

- Fonts and typography: Manrope, headline scale, button labels, feature labels, and type hierarchy are unchanged. The desktop copy group moves left responsively to preserve clear separation from the regenerated mascot.
- Spacing and layout rhythm: all four gem shapes fit above the feature strip at the desktop fold. The mobile fold also shows all four gems and the watering interaction. The hero now leaves at least `64px` of background breathing room below the dashboard.
- Colors and tokens: the existing deep emerald, mint, cyan, purple, amber, and warm caramel palette is preserved.
- Image quality and asset fidelity: the new `1024x1536` WebP preserves the low-poly garden and warm-brown mascot, makes the water land on the orange gem, and adds a substantial leafy foreground. The optimized critical asset is `115,424` bytes.
- Copy and content: no customer-facing copy changed.
- Interactions and diagnostics: both hero CTAs retain their signup/sign-in destinations and analytics identifiers. No browser errors were reported. Local-only warnings for disabled PostHog and the unavailable visit-alert function are expected in this preview environment.

## Comparison history

1. **P1 - Water landed beside the orange gem and the four-gem set was obscured.**
   - Fix: regenerated the garden, then made one targeted edit that moved the orange gem under the existing water stream. Repositioned the tall asset responsively so all four gem shapes remain visible at desktop and mobile folds.
   - Post-fix evidence: `tall-garden-hero-before-after.jpg` and both final fold screenshots.
2. **P1 - The leafy artwork ended partway down the dashboard.**
   - Fix: outpainted the scene into a tall `2:3` canvas with an extended leafy foreground and added explicit hero padding below the dashboard.
   - Post-fix evidence: `tall-garden-dashboard-before-after.jpg`; the dashboard is complete and leafy artwork remains visible below it.
3. **P2 - Raising the new art initially placed the mascot behind the hero copy.**
   - Fix: shifted the desktop copy group left with a viewport-aware offset while keeping the feature strip centered.
   - Post-fix evidence: final desktop fold screenshot; copy and mascot no longer collide.

## Open questions

- None blocking.

## Follow-up polish

- The generated `1024px`-wide source is enlarged on wide desktop displays. It remains visually clean at the tested size, but a future higher-resolution generation would improve retina sharpness if the asset becomes a long-term campaign centerpiece.

final result: passed

---

# Public Tools navigation and signup handoff design QA

- source visual truth path: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/tools-nav-before-desktop.png`
- implementation screenshot paths: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/tools-nav-desktop.png` and `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/tools-nav-mobile.png`
- viewport: desktop `1440 × 900` CSS pixels; mobile `390 × 844`
- combined comparison evidence: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/tools-nav-comparison.png`

## Findings

No actionable P0, P1, or P2 differences remain.

- Navigation hierarchy: Tools sits before the existing Sign in and Join actions, so it reads as product exploration rather than another account action.
- Desktop interaction: the native details control exposes one focused destination without widening or restructuring the existing header. The menu stays above hero content and uses the existing white surface, green accent, border, radius and shadow system.
- Mobile interaction: Home planner appears first in the existing mobile menu, followed by a divider and the unchanged account actions. The card stays within the 390-pixel viewport with no horizontal overflow.
- Copy: the item names the tool and its three concrete outputs - deposit, mortgage and real home costs - without repeating the planner introduction.
- Signup handoff: the results CTA keeps its existing visual treatment and now targets the app's explicit signup intent instead of the default authentication mode.
- Image quality and asset fidelity: no raster assets changed. The menu reuses the site's existing Lucide icon set and logo assets.

## Interaction and responsive checks

- Tools uses native summary/details keyboard behaviour with visible focus and an ordinary destination link.
- Desktop and mobile both expose the same Home planner destination.
- The existing sticky header remains above the menu and the mobile menu keeps its existing expanded-state control.
- No keyboard shortcut is warranted for a low-frequency public navigation menu.

final result: passed
