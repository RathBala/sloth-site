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
