# Home planner mortgage comparison design QA

- source visual truth path: `/Users/rathbala/.codex/generated_images/01a03293-f755-7e42-9ef8-716b35c1d2e9/exec-01fb5591-57b9-4f17-830d-45685bb5b57d.png`
- implementation screenshot path: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-three-column-desktop.png`
- responsive screenshot paths: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-three-column-narrow.png` and `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-three-column-mobile.png`
- viewport: desktop `1440 × 1024` CSS pixels; narrow desktop `1024 × 768`; mobile override `390 × 844`
- dimensions and normalization: source `1487 × 1058` pixels; desktop implementation `1440 × 1024` pixels at 1× density; narrow capture `1024 × 768`; the in-app browser produced a `375 × 812` visible mobile capture. The full-view comparison center-crops both desktop artifacts to `720 × 512` before placing them side by side.
- state: £1,000,000 home, 40% deposit, £600,000 mortgage, 4.0% rate, 30-year term; Part-and-part selected with 50% on repayment and 50% interest-only
- full-view comparison evidence: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-three-column-comparison.png`
- focused region evidence: the narrow and mobile screenshots above show all three mortgage choices, selected state, split control and balance table at readable size

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: the implementation retains the existing Manrope type system and strong payment hierarchy. Card copy now contains only the method, monthly payment and end balance. All three titles remain on one line at the tight `1024px` desktop viewport.
- Spacing and layout rhythm: the three methods use equal-width cards in one desktop row, with matching height and padding. The split control sits below the row only when Part-and-part is selected. Mobile deliberately stacks the same cards at full width so the figures remain readable.
- Colors and visual tokens: every method uses the same neutral surface and the same green selected treatment. The split slider also uses the standard planner surface, border and focus tokens. No mortgage method has a purple or warning-coloured variant.
- Image quality and asset fidelity: the existing optimized low-poly home-planner art and Lucide icon set remain unchanged and sharp. No substitute art, handcrafted icon, CSS drawing or placeholder asset was introduced.
- Copy and content: repeated explanatory sentences were removed from the cards. “Left at the end” is intentionally shorter because the term is already visible in the adjacent assumptions and balance table.

The source concept shows two mortgage cards because it predates the Part-and-part requirement. The latest user direction intentionally overrides that detail with three equal columns. The implementation preserves the concept's comparison-first hierarchy while fitting the additional choice without shrinking the surrounding controls.

## Comparison history

1. The earlier implementation placed Part-and-part in a full-width row beneath Repayment and Interest-only. The latest direction required all three choices to have equal prominence in one row. The desktop grid now uses three equal tracks and all method-specific colour variants have been removed. Post-fix evidence: `home-planner-three-column-desktop.png`.
2. The first narrow-desktop pass allowed the Part-and-part title to wrap because its selected check consumed inline width. The check is now positioned independently, leaving all three titles on one line. Post-fix evidence: `home-planner-three-column-narrow.png`.
3. The mobile pass confirmed the cards stack at equal full width, the selected state remains obvious without relying on colour alone, and the Part-and-part split control stays directly attached to the choice. Post-fix evidence: `home-planner-three-column-mobile.png`.
4. The final full-view and focused comparisons found no remaining actionable P0/P1/P2 differences.

## Interaction and responsive checks

- Repayment, Interest-only and Part-and-part update the headline mortgage payment, full monthly cost, mortgage description and deposit scenarios.
- Part-and-part exposes a live 5% to 95% repayment-share slider and updates its payment and outstanding balance immediately.
- Native radio controls support Tab and arrow-key selection with a visible focus state. No additional shortcut is warranted for this short, one-off comparison.
- Automated browser measurements confirm equal card widths and top alignment on desktop, no container overflow, and identical selected background, border and shadow styles for all three methods.
- Desktop keeps the illustrated panel fixed while the right side scrolls. Mobile places the mortgage choices before the assumptions and has no horizontal overflow.
- Browser console errors checked: none from the planner implementation.

## Follow-up polish

No P3 follow-up is required for this iteration.

final result: passed
