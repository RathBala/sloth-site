# Visual Asset Workflow

Use this guide when generating or replacing Sloth Money raster assets such as the logo sloth, homepage guide mascot, archetype cards, paid social images, or other sloth illustrations.

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
