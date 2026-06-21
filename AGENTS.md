# AGENTS.md

## Copywriting

When writing or editing **user-facing copy** (landing pages, CTAs, headings, meta text), read and follow [`.cursor/skills/copywriting/SKILL.md`](.cursor/skills/copywriting/SKILL.md) - including punchy headings, concision, specificity (name what people are saving toward or catching up on), punctuation (e.g. spaced hyphen instead of em dash for sentence bridges), and scannable structure.

## Before writing any code

1. State how you will verify that this change works (test, bash command, browser check etc)
2. Write the test(s) for verification first - UNLESS it's a script. Do NOT write scripts i.e. skip to code if you're thinking scripts.

## Verification - required

- After any code change, run the fastest relevant verification command
- If verification fails, read the output, fix the root cause, and rerun until it passes
- In your final message, report exactly what you ran and whether it passed

## Commands

- Install: yarn install
- Lint: yarn lint
- Typecheck: yarn typecheck

## Pushing from Codex worktrees

- Codex worktrees may be on a detached `HEAD`. When pushing a completed mainline
  change to `main`, prefer `bin/push-main-from-worktree` so the worktree fetches
  `origin/main`, rebases local commits if needed, runs verification, and pushes
  `HEAD:main` safely.
- Use `bin/push-main-from-worktree --dry-run` before the real push when you want
  to confirm the rebase and checks without updating the remote.

## Package manager

- This repo uses Yarn v1. Use `yarn install` and commit `yarn.lock`.
- Do not create, update, or commit `package-lock.json`; it is ignored because duplicate lockfiles create duplicate Dependabot alerts and unclear dependency state.
- Dependency security fixes should prefer low-risk Yarn changes first: lockfile-only updates, patch/minor devDependency updates, or targeted `resolutions` for patched transitive development dependencies.
- Do not merge major upgrades, runtime dependency upgrades, source-code changes, or build-system rewrites as part of automated dependency-security maintenance without human review.
