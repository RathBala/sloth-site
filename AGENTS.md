# AGENTS.md

## Copywriting

When writing or editing **user-facing copy** (landing pages, CTAs, headings, meta text), read and follow [`.cursor/skills/copywriting/SKILL.md`](.cursor/skills/copywriting/SKILL.md) - including punchy headings, concision, specificity (name what people are saving toward or catching up on), punctuation (e.g. spaced hyphen instead of em dash for sentence bridges), and scannable structure.

## Visual Asset Direction

- Generated Sloth Money sloth assets should use warm tan and caramel-brown fur like the current Solo/Couple archetype cards. Keep cream face markings and dark brown eye patches for recognizability.
- Do not generate green sloths for logo, mascot, hero, archetype, or promotional assets unless the user explicitly asks for a special variant. Use green for backgrounds, leaves, gems, and brand environment instead.
- For generated sloth asset prompts, export steps, iteration limits, and screenshot QA, follow [`docs/visual-assets.md`](docs/visual-assets.md).

## Visual Verification

- For visual changes, do not rely only on DOM/CSS checks or isolated screenshots. Capture and inspect the exact viewport state the user will see, including the transition area before and after the changed element.
- If the user is reacting to a screenshot, reproduce that scroll position and compare against it before finalizing.
- When checking color or dimming changes, verify the full composed result in the browser screenshot rather than inferring from a single CSS property.
- For multi-step forms, inspect every question-group boundary at real desktop and mobile sizes. Treat readable type and clear grouping as the priority; allow the content panel to scroll instead of compressing text and spacing merely to fit one viewport.
- Wait for entrance and stage-transition motion to settle before taking verification screenshots. Reject faded or displaced mid-animation captures.

## Tracking Inventory

- `docs/tracking-inventory.md` is the source of truth for marketing-site analytics, visit alerts, attribution handoff, and disabled tracking providers.
- When adding, removing, or changing logging, analytics, alerts, third-party tracking, or data sent to another service, review and update that inventory in the same change.
- After updating the inventory, check whether `src/privacy/index.html`, provider docs, or tracking regression checks also need updates.

## Production Browser Testing

- Use a local preview by default. Local page visits cannot reach the production Telegram visit-alert function.
- Before an agent or automated browser opens any page on `https://slothmoney.app` in a fresh browser session or profile, first open `https://slothmoney.app/mark-me.html` in that same browser and wait for the page to confirm that alerts are disabled. Do this before the first tracked production page load; do not assume the cookie survived an earlier session.
- Never call the live `/.netlify/functions/track-visit` endpoint to test it. Use `yarn check:tracking`, which mocks Telegram delivery.

## Before writing any code

1. State how you will verify that this change works (test, bash command, browser check etc)
2. Write the test(s) for verification first - UNLESS it's a script. Do NOT write scripts i.e. skip to code if you're thinking scripts.

## Verification - required

- After any code change, run the fastest relevant verification command
- If verification fails, read the output, fix the root cause, and rerun until it passes
- In your final message, report exactly what you ran and whether it passed

## Final response next steps

- Before writing `Next steps for you: None.`, ask whether the change is worth the user manually checking in a browser, device, dashboard, account, or production environment.
- If manual verification would be useful, include concise numbered steps under `Next steps for you` instead of saying `None`.
- Manual test steps should name the exact page, flow, command, account, or environment to check and what result to expect.
- State clearly when the work is only local and still needs to be committed or pushed to `main`; do not leave the user to infer git state.
- Use `Next steps for you: None.` only when there is genuinely nothing useful for the user to verify or do outside the agent's local workspace.

## Commands

- Install: yarn install
- Lint: yarn lint
- Typecheck: yarn typecheck

## Pushing from Codex worktrees

- When starting work in a Codex worktree, do not keep working directly on
  `main`. Create a short-lived branch from the current baseline first, using a
  clear name such as `codex/<task-slug>` or `agent/<task-slug>`.
- Worker branches may be pushed independently. When the work is ready for
  `main`, fetch/rebase or merge against the latest `origin/main`, resolve
  conflicts once, run verification, and then push or merge to `main`.
- Codex worktrees may be on a detached `HEAD`. When pushing a completed mainline
  change to `main`, prefer `bin/push-main-from-worktree` so the worktree fetches
  `origin/main`, rebases local commits if needed, runs verification, and pushes
  `HEAD:main` safely.
- Use `bin/push-main-from-worktree --dry-run` before the real push when you want
  to confirm the rebase and checks without updating the remote.

## Generated CSS

- `src/output.css` is committed generated output for the static site. It is
  valid for feature branches to regenerate it while verifying local changes, but
  the final branch or mainline integration must regenerate it after the final
  rebase or merge so it reflects the resolved HTML and Tailwind classes.
- Use the repo's Yarn v1 commands for regeneration. Run `yarn build` for the
  deploy-equivalent minified output. When restoring the readable checked-in
  format after a build check, run:

  ```bash
  ./node_modules/.bin/tailwindcss -i ./src/assets/css/tailwind.css -o ./src/output.css
  ```

## Package manager

- This repo uses Yarn v1. Use `yarn install` and commit `yarn.lock`.
- Do not create, update, or commit `package-lock.json`; it is ignored because duplicate lockfiles create duplicate Dependabot alerts and unclear dependency state.
- Dependency security fixes should prefer low-risk Yarn changes first: lockfile-only updates, patch/minor devDependency updates, or targeted `resolutions` for patched transitive development dependencies.
- Do not merge major upgrades, runtime dependency upgrades, source-code changes, or build-system rewrites as part of automated dependency-security maintenance without human review.
