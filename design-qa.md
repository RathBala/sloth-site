# Home planner mortgage comparison design QA

- source visual truth path: `/Users/rathbala/.codex/generated_images/01a03293-f755-7e42-9ef8-716b35c1d2e9/exec-01fb5591-57b9-4f17-830d-45685bb5b57d.png`
- implementation screenshot path: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-repayment-desktop.png`
- responsive screenshot path: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-interest-only-mobile.png`
- viewport: desktop `1440 × 1024` CSS pixels; mobile `390 × 844` CSS pixels
- dimensions and normalization: source `1487 × 1058` pixels normalized to `1440 × 1024`; desktop implementation `1440 × 1024` pixels at 1× density; mobile implementation `375 × 812` captured pixels from the in-app browser's visible viewport
- state: £1,000,000 home, 40% deposit, £600,000 mortgage, 4.0% rate, 30-year term; desktop comparison uses Repayment + Fixed, with Interest-only + Tracker also captured and tested
- full-view comparison evidence: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-concept-2-comparison.png`
- focused region comparison evidence: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-concept-2-focus-comparison.png`

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: the implementation retains the existing Manrope product type system and matches the concept's heavy numeric hierarchy, compact labels, and plain-language supporting copy.
- Spacing and layout rhythm: the two repayment cards remain the dominant decision, the separate rate control sits directly below them, and the balance comparison is visually subordinate. Existing Sloth Money radii and spacing were kept rather than copying the concept literally.
- Colors and visual tokens: repayment uses the established planning green; interest-only uses a calm peach warning state; the end-balance summary uses the existing purple accent. Checked state also includes a visible check and label, so it does not rely on color alone.
- Image quality and asset fidelity: the existing optimized low-poly home-planner art and Lucide icon set remain unchanged and sharp. No substitute art, inline SVG, CSS drawing, or placeholder asset was introduced.
- Copy and content: repayment method and rate behaviour are separated. Interest-only explicitly says that the borrowed amount remains and needs a separate repayment plan.

The generated concept uses a line chart. The implementation deliberately uses a compact semantic balance table instead: it preserves the same start-to-end comparison, stays legible on mobile, and avoids adding a chart dependency for two simple series.

## Comparison history

1. Initial comparison found a P2 mobile hierarchy issue: assumptions appeared before the mortgage choice. The results grid was changed to place the mortgage choice first on mobile while keeping assumptions beside it on desktop. Post-fix evidence: `home-planner-interest-only-mobile.png`.
2. Initial focused comparison found a P2 clarity issue: Fixed and Tracker had no visible group label. The visible “How should the rate behave?” legend was restored. Post-fix evidence: `home-planner-concept-2-focus-comparison.png`.
3. The final full-view and focused comparisons found no remaining actionable P0/P1/P2 differences.

## Interaction and responsive checks

- Repayment and Interest-only both update the mortgage payment, full monthly cost, mortgage description, end balance, and deposit scenarios.
- Fixed and Tracker update the explanation independently without changing the current-rate calculation.
- Native radio controls support Tab and arrow-key selection with a visible focus state.
- Desktop keeps the illustrated panel fixed while the right side scrolls. Mobile shows the mortgage choice before the assumptions and has no horizontal overflow.

## Follow-up polish

- P3: a future chart component could replace the balance table if the site adopts a shared data-visualisation dependency; it is not needed for this comparison.

final result: passed
