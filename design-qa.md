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
