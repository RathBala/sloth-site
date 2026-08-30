**Findings**

- No actionable P0/P1/P2 findings remain.

**Source visual truth**

- Selected concept: `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-ffaf6e6e-6470-4e60-b222-d3195c7193d1.png`.
- Corrective references: `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-dffafff6-6d5c-4be7-8af5-a0f8be5976a1.png` for the short desktop wizard and `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-c30639ca-c055-48f7-89a9-4e1e292723c4.png` for the live-plan levers.
- Corrective reference: `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-319e7ded-0c54-44a7-adbd-a618e8c8066c.png` for the slightly overflowing home step and exposed green strip below the artwork.
- Latest corrective reference: `/var/folders/qf/ng7v7hxs3g3d_8kj4705c_900000gn/T/codex-clipboard-530a6733-72d8-45be-bba0-f6cabc20257a.png` for the remaining green patch on the scrolled results screen and the requested fixed-left, independently scrolling-right layout.
- The concept's `Free home ownership planner` eyebrow remains intentionally omitted at the user's request.
- The page now reaches every viewport edge. The warm panel still has its own task padding; the removed padding was the outer page frame.

**Fresh implementation evidence**

- Local URL: `http://127.0.0.1:3000/home-planner/`.
- Short desktop deposit step: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-compact-step-one-reference-height.png`.
- Exact yearly income: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-exact-income.png`.
- Desktop live plan: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-results-reference-height.png`.
- Shared document scroll: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-single-page-scroll.png`.
- Mobile deposit step: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-compact-mobile.png`.
- Deposit-step comparison: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-step-one-comparison.png`.
- Results comparison: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-results-comparison.png`.
- Home-step comparison: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-home-step-comparison.png`.
- Home step without desktop scrolling: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-home-step-no-scroll.png`.
- Scrollable route step with continuous artwork: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-route-shared-scroll.png`.
- Tightened mobile home step: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-home-step-mobile.png`.
- Fixed-left desktop results: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-fixed-left-results.png`.
- Fixed-left comparison: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-fixed-left-comparison.png`.
- Mobile results after the desktop scroll change: `/Users/rathbala/.codex/visualizations/2026/08/24/01a03293-f755-7e42-9ef8-716b35c1d2e9/home-planner-fixed-left-mobile-results.png`.
- Density normalization: the `2876 × 1572` source includes `76px` of browser chrome. Its `2876 × 1496` content crop was normalized to the implementation's `1440 × 748` CSS viewport at density 1 before the full-view comparison. A focused crop was unnecessary because the named defect occupies the entire left column and is clearly legible in the normalized full view.
- Desktop checks use `1440 × 748` to match the screenshot's effective browser viewport. The full automated interaction flow passes at that height, and the deposit step has zero document overflow.
- At the same `1440 × 748` viewport, the home step has a `748px` document height and its action ends at `687px`, so it does not scroll.
- On desktop results, the document remains `748px` tall with `window.scrollY = 0`. The warm panel is a `748px`-tall scroll container with `1,978px` of content, while the artwork remains fixed from `0px` to `748px` and owns the bottom-left viewport point.
- Mobile viewport: `390 × 844`, with zero horizontal overflow.

**Required fidelity surfaces**

- Typography and hierarchy: Manrope, Sloth green, the two-line dream-home headline, mint action, and concise benefit list preserve the approved concept.
- Composition: the low-poly journey remains on the left and the curved warm task panel remains on the right. Desktop is full bleed; mobile becomes an art banner over the task panel.
- Interaction: present-day savings, dream home, buying route, and future budget are four distinct steps. The live-plan screen connects all inputs through adjustable levers.
- Range controls: deposit covers `0%` through `100%`. Home price accepts exact whole-pound values from `£25,000` through `£20,000,000`; its logarithmic slider keeps ordinary prices usable instead of compressing them against the left edge.
- Scrolling: desktop locks the split layout to the viewport. The journey artwork stays fixed on the left, while the warm panel on the right owns vertical scrolling for every wizard and results state. Mobile retains ordinary document scrolling so the stacked layout remains natural.
- Uncertainty: explicit `Not sure` or skip choices are available for location, home type, price, buying route, first-time buyer status, and income where appropriate.
- Education: buying-route and mortgage-route explanations use progressive disclosure so the main task remains scannable.
- Accessibility: native inputs back the custom controls, the active step uses `aria-current="step"`, programmatic focus moves to each new stage, Back restores the previous action, and reduced-motion preferences are respected.
- Asset delivery: the critical `1134 × 1416` journey art is preloaded as a 144 KB WebP with a compressed JPEG fallback. The automated planner check enforces 200 KB WebP and 300 KB fallback budgets.

**End-to-end browser result**

- Example inputs: £25,000 saved, £1,000 saved monthly, £350,000 house in England or Northern Ireland, first-time buyer, £1,600 future mortgage comfort figure, and £70,000 combined gross income.
- Result: £1,691 monthly mortgage, £2,408 full monthly home cost, £49,500 cash target, and a 2 year 1 month savings timeline.
- Whole-home results hide shared-ownership-only rent and share controls. Shared ownership remains covered by the calculation tests.
- The mobile first deposit screen does not contain the future mortgage-budget question.
- Exact values such as `£287,501` home price, `£123` monthly saving, and `£5,400` yearly income remain valid. A `100%` deposit produces a `£0/mo` mortgage, and the exact `£20,000,000` upper home-price limit stays synchronized with the broad slider.

**Intentional differences**

- The live HTML milestone labels use Lucide diamond icons rather than the concept's rendered gem artwork so they remain crisp and accessible.
- The results state gives more width to the warm panel than the intro concept needs, because the live levers and linked cost cards require a denser working surface.
- The home-price lever pairs an exact number field with a non-linear range. This adds precision and keeps the full property-market span practical, whereas a linear `£25,000` to `£20,000,000` slider would bunch typical prices at the start.

**Comparison history**

- P1: the earlier shared-document scroll moved the `100svh` artwork out of view and exposed the shell's flat green background below it on long results pages.
- Fix: desktop now locks the document and split shell to the viewport, keeps the artwork fixed, and makes `.planner-content` the only vertical scroll owner. Stage changes reset that panel to the top.
- Post-fix evidence: the fixed-left comparison shows the same scrolled results state without the green patch. Browser measurements confirm the window stays at `0`, the right panel scrolls, and the artwork remains exactly one viewport tall.

**Open questions**

- None blocking.

final result: passed
