# Home planner mortgage comparison design QA

- source visual truth path: `/Users/rathbala/.codex/generated_images/01a03293-f755-7e42-9ef8-716b35c1d2e9/exec-01fb5591-57b9-4f17-830d-45685bb5b57d.png`
- implementation screenshot path: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-part-and-part-desktop.png`
- CTA screenshot path: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-signup-cta-desktop.png`
- responsive screenshot paths: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-part-and-part-mobile.png`, `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-part-and-part-mobile-detail.png`, and `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-signup-cta-mobile.png`
- viewport: desktop `1440 × 1024` CSS pixels; mobile override `390 × 844` CSS pixels
- dimensions and normalization: source `1487 × 1058` pixels; desktop implementation `1440 × 1024` pixels at 1× density; mobile captures `375 × 812` pixels from the in-app browser's visible content viewport. The full-view comparison center-crops both desktop artifacts to `720 × 512` before placing them side by side.
- state: £1,000,000 home, 40% deposit, £600,000 mortgage, 4.0% rate, 30-year term; Part-and-part selected with 50% on repayment and 50% interest-only
- full-view comparison evidence: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-part-and-part-comparison.png`
- focused region evidence: the desktop and mobile detail screenshots above show the selected mortgage card, live split control, rate choice and balance table at readable size

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: the implementation retains the existing Manrope system and the concept's strong numeric hierarchy. Removing both helper paragraphs reduces repetition without weakening the headings.
- Spacing and layout rhythm: Repayment and Interest-only remain the two side-by-side anchors from the selected concept. Part-and-part is a full-width third choice with its split lever directly underneath, so it is prominent without squeezing three dense cards into one row. The fixed artwork and independently scrolling content panel remain intact on desktop.
- Colors and visual tokens: repayment keeps planning green, interest-only keeps the calm warning treatment, and the mixed method uses the existing purple accent. Every selected state also includes a check and label, so meaning does not rely on color alone.
- Image quality and asset fidelity: the existing optimized low-poly home-planner art and Lucide icon set remain unchanged and sharp. No substitute art, handcrafted icon, CSS drawing or placeholder asset was introduced.
- Copy and content: the requested helper copy and duplicate end-balance panel are gone. “Bills and repairs” now reads naturally. The new CTA is concise and clearly separated from the financial disclaimer.

The generated concept uses a line chart. The implementation deliberately keeps the compact semantic balance table because it now compares three methods, remains readable on mobile and avoids a chart dependency for a small number of checkpoints.

## Comparison history

1. The first implementation pass placed all three repayment choices in one desktop row. The Part-and-part heading wrapped awkwardly and the cards felt crowded. Repayment and Interest-only were restored to the concept's two-column row and Part-and-part was given a full-width row beneath them. Post-fix evidence: `home-planner-part-and-part-desktop.png`.
2. The first mobile capture showed the mixed card's payment and remaining balance overlapping because its desktop two-column internals survived the one-column breakpoint. The mobile mixed card now uses one column and left-aligns the balance. Post-fix evidence: `home-planner-part-and-part-mobile-detail.png`.
3. The final full-view, focused and CTA comparisons found no remaining actionable P0/P1/P2 differences.

## Interaction and responsive checks

- Repayment, Interest-only and Part-and-part update the headline mortgage payment, full monthly cost, mortgage description and deposit scenarios.
- Part-and-part exposes a live 5% to 95% repayment-share slider and updates its payment and outstanding balance immediately.
- Fixed and Tracker stay independent from the repayment method.
- The missed-cost controls are permanently visible in their existing tinted container.
- Native radio controls support Tab and arrow-key selection with a visible focus state.
- Desktop keeps the illustrated panel fixed while the right side scrolls. Mobile places the mortgage choices before the assumptions and has no horizontal overflow.
- The signup CTA points to the existing Sloth Money app and uses the site's existing CTA attribution handling.
- Browser console errors checked: none from the planner implementation.

## Follow-up polish

No P3 follow-up is required for this iteration.

final result: passed
