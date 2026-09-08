# Visual Asset Workflow

Use this guide when generating or replacing Sloth Money raster assets such as the logo sloth, homepage guide mascot, archetype cards, paid social images, or other sloth illustrations.

## Everyday feature component captures

The four `everyday-*.webp` assets must be captures of canonical `sloth-budget`
components. Do not generate or redraw financial product UI. A feature existing
in source code does not make an invented depiction accurate. Preserve the
component's real labels, controls, colours, calculations and arrangement; crop
surrounding app chrome when a close-up is more useful. User-approved capture-only
omissions, such as hiding a redundant icon, must be recorded with their exact
selector in the capture provenance. Do not carry those omissions into app code.

Use the app's isolated preview routes and existing fixtures, without signing in
or loading personal accounts. See [`everyday-features.md`](everyday-features.md)
for exact component provenance, routes, crops and delivery sizes. Capture at 2x
rendering density, then crop and compress with metadata removed. Do not upscale
a low-resolution screenshot. Inspect exports in the actual landing page at
both desktop and mobile sizes before accepting them. For a row of product
captures, compare the visible component heights as well as the surrounding image
slots and title alignment; use a native responsive view before stretching art.

The four-column concept remains the layout reference. Its generated product
illustrations were rejected and are not an approved source for future assets.

## Sloth Style

- Sloths should use warm tan and caramel-brown fur, cream face markings, dark brown eye patches, and a black nose.
- Keep the low-poly faceted 3D style used by the current Solo/Couple archetype cards.
- Do not generate green sloths unless a user explicitly asks for a special variant. Use greens for backgrounds, leaves, gems, badges, and the brand environment.
- Keep mascot expressions friendly, confident, and useful rather than overly cute or generic.

## Prompt Snippets

Logo icon:

```text
Cute low-poly sloth head logo mark, centered, happy gentle smile, cream face markings, dark brown eye patches, black nose, warm tan and caramel-brown fur, surrounded by a small faceted green leafy badge shape. No text. No currency symbols. No green sloth fur.
```

Hero guide mascot:

```text
Cute low-poly sloth upper body, smiling calmly, one arm raised with index finger pointing upward, cream face markings, dark brown eye patches, black nose, warm tan and caramel-brown fur. A small faceted purple speech bubble with a white heart floats near the raised hand. No text. No green sloth fur.
```

Archetype or option card:

```text
Polished low-poly faceted 3D Sloth Money mascot art with warm tan and caramel-brown fur, cream face markings, dark brown eye patches, and a confident friendly expression. Use a deep emerald card background if the asset is card art. No text or watermark.
```

## Export Checklist

1. Generate the source asset.
2. Prepare exact PNG and WebP outputs with `yarn asset:prepare-sloth`.
3. Verify the asset in the real page, at the rendered desktop and mobile sizes.
4. Cache-bust browser checks after replacing image files, for example `index.html?v=asset-refresh-1`.
5. Keep generated source prompts in the final response when the asset is project-bound.

Example:

```bash
yarn asset:prepare-sloth \
  --input /path/to/generated.png \
  --png src/assets/images/sloth-guide-sidekick.png \
  --webp src/assets/images/sloth-guide-sidekick.webp \
  --width 320 \
  --height 423 \
  --key '#ff00ff' \
  --fuzz 24 \
  --erode 1
```

Use `--key none` for assets that already have a clean transparent background.

## Loop Prevention

- Actual page context beats isolated pixels. Inspect browser screenshots before spending time on edge pixels.
- Limit image generation to two attempts unless the user asks to keep exploring.
- Limit transparent-background cleanup to two post-processing attempts. After that, inspect the asset in browser context and either accept it, ask the user, or record optional polish.
- Do not tune transparent edges against a black preview unless the asset actually renders on black.
- If a tiny artifact is not visible at the rendered size, ship it and note optional future polish.

## Transparency Notes

- Chroma-key removal can leave antialiased edge color. Prefer a key color that does not appear in the subject.
- For assets rendered only on the dark green site background, a small matte artifact may be acceptable after browser verification.
- If clean transparency is essential, consider a true transparent-generation path rather than repeated chroma-key tuning.

## Tailwind And CSS

- If you add new Tailwind arbitrary utility classes, rebuild `src/output.css` in the same change.
- For one-off component sizing, prefer component-owned CSS inside the page so the static site does not depend on a missing generated utility.

## Browser QA

- Capture desktop and relevant mobile screenshots for visual asset changes.
- Verify image files load from the intended paths and have expected natural dimensions.
- Cache-bust browser checks after replacing assets.

## Product Screenshot Close-ups

Choose the one product action the image should explain and its maximum rendered
size before capturing. Use the real app's local previews, keeping readable labels
and the action together. Capture at least twice the rendered size; enlarging an
old bitmap does not restore detail. Wait for fonts and drawer motion to settle,
then inspect the saved image before compressing it.

The first homepage feature uses the real `CategorySuggestionReviewDrawer` from
the sibling `sloth-budget` repository. Start its isolated preview with
`SLOTH_PREVIEW_FRONTEND_PORT=5276 yarn dev:e2e:preview` and open
`http://127.0.0.1:5276/__preview/category-suggestion-review?drawer=1`.
It requires no sign-in or live data. The fixture state is local to the page and
resets on reload; no app source or persisted records need changing.

- Show only the Ready group and its two suggestions. Exclude the drawer header,
  close button, bulk action, scrollbar, and later groups.
- For desktop, use the real table layout in a temporary 1000 CSS pixel drawer.
  The wider capture-only drawer prevents category labels from being truncated;
  it does not change the production app. Keep the image below centered feature
  copy, with the three benefits beneath it. Review this composition at its final
  page size before preparing mobile assets.
- Mobile uses the existing real 390 CSS pixel card layout, cropped to the same
  Ready group. Do not stretch the mobile layout into a desktop illustration.
- Exports are `feature-auto-categorisation-desktop.webp` at 2426 × 526 and
  `feature-auto-categorisation-mobile.webp` at 696 × 914. Maximum rendered widths
  are 1086 and 348 CSS pixels respectively. Preserve intrinsic proportions.
- Export WebP with `cwebp -q 92 -m 6 -sharp_yuv -metadata none`. Aim for under
  60 KB per image; the browser loads only the matching responsive source.
- For high-resolution capture, a temporary same-origin HTML frame may render
  the unchanged demo at a larger CSS transform scale. Use a fixed-position frame
  to avoid focus-induced scrolling. Load capture-only styles through an external
  script so the app's content security policy remains intact. Remove the
  temporary capture files afterward.
- Inspect the full saved frame before cropping during export. Reported viewport
  dimensions and painted pixels can differ with browser zoom or host scaling;
  clipped exports of transformed frames can contain stitching artifacts.
- Run `yarn check:home-visibility` to check 2x density, responsive source choice,
  preserved proportions, and a wide desktop layout. Use
  `HOME_VISIBILITY_SCREENSHOT_DIR=/tmp/sloth-site-qa` with that command to save
  page-context evidence, then inspect the first feature at desktop and mobile sizes.

This asset refresh does not change categorisation behavior, tracking, or public
routes. Existing page metadata and crawler policy remain covered by
`yarn check:public-site`.

### Four-feature presentation

All four homepage features follow the same order: centered heading and short
explanation, a focused visual, then three benefits. Open directly with the first
feature; a separate large introduction creates two competing headings. Preserve each visual's natural
proportions instead of forcing every example into a common screenshot ratio.
The three raster examples switch to their desktop source at 1024 CSS pixels.

| Feature            | Desktop export                         | Mobile export              | Maximum rendered image width |
| ------------------ | -------------------------------------- | -------------------------- | ---------------------------- |
| Categorisation     | 2426 × 526                             | 696 × 914                  | 1086 / 348 CSS px            |
| Budget suggestions | 1834 × 1300                            | 730 × 1554                 | 862 / 348 CSS px             |
| Scenarios          | 1518 × 1100                            | 644 × 782                  | 702 / 322 CSS px             |
| CLI                | Native HTML command and output excerpt | Same text, wrapping to fit | 896 CSS px frame             |

Budget captures use the isolated `/__preview/budget-health-review` route from
`sloth-budget` with a temporary 900 CSS pixel desktop drawer or the existing
390 CSS pixel mobile layout. Hide only the drawer title/close header and expand
the scroll region for capture. Keep the balanced £177 change, both categories,
and the final save action. The screenshot is illustrative, with no live controls.

Scenario exports use the existing real `benefit four.png` source. Desktop shows
the scenario branch; mobile crops the two contribution cards at x=708, y=154,
width=644, height=782 so their values remain readable. Do not add invented forecast
dates. Keep the original PNGs: the wedding page still owns references to them.

The CLI example uses a verified `sloth-agent budget move` dry run and a JSON
output excerpt. Omitting `--apply` makes no request and changes no saved data.
Keep this as selectable HTML text; do not bring back terminal screenshot SVGs.
No custom keyboard shortcuts are needed for static illustrations.

The combined responsive raster transfer budget is 200 KB on desktop and 140 KB
on mobile. The visibility check enforces these budgets alongside 2x density,
proportions, feature order, and page overflow. These below-fold assets are not
preloaded. Run `HOME_VISIBILITY_SCREENSHOT_DIR=/tmp/sloth-site-qa yarn
check:home-visibility` for context and complete screenshots of all four features.
Inspect desktop and mobile captures, including the transitions between blocks.
Capture dimensions must be measured from saved pixels: host scaling may differ
from both the requested viewport and CSS transform. Start with a small capture
and confirm its painted bounds before producing the full set.

Only the marketing presentation changes. App behavior, persistence, APIs, CLI
implementation, analytics, and operational logging remain unchanged.
