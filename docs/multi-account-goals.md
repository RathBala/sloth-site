# Multi-account Goal documentation

The developer page documents the new automatic multi-account and explicit-share
Goal contract in `sloth-budget` and published `sloth-agent-cli` 0.29.1. The funding object replaces the singleton reference; examples explain
current allocations, projected money, shortfalls and atomic target/split edits.

Public base: https://slothmoney.app. Static artifact: `src`, hosted by Netlify.
`/developers/` and `/privacy/` remain indexable with their existing canonical/social
metadata. No route, crawler policy, sitemap membership, robots exclusion or
redirect changed. `llms.txt` adds the multi-account capability. Existing
`check:public-site` owns route classification and crawl/discovery regressions.

Verification: `yarn build` (developer CLI docs, published baseline release check,
public-site checks and CSS) passed. `node scripts/check-developer-cli-docs.mjs`
asserts new funding flags/configuration and rejects the obsolete singleton field.
Local HTTP /developers/ returned200 and rendered initial HTML with JavaScript
disabled at1440×1024 and390×844. Evidence is local, not production deployment.

UI/API/CLI persistence and migration are owned by sloth-budget's
`docs/features/multi-account-goals.md`; no site runtime API or worker changed.
Operational logs and product analytics are unchanged: documentation only, with no
new action/funnel to measure. Existing tracking/privacy behavior remains intact.

For local review:

```sh
cd /Users/rathbala/.codex/worktrees/6588/sloth-site
python3 -m http.server 3375 --bind 127.0.0.1 --directory src
```

Open http://127.0.0.1:3375/developers/#multi-account-goals. No sign-in is needed.
Check command examples, horizontal code scrolling on mobile, and fixed-share
shortfall explanation. Stop with Ctrl+C. The staged release is authorized and follows the verified CLI publication.

The final release removes temporary Goal-funding negotiation from the API and
CLI. The public minimum install points to 0.29.1; multi-account command support
was introduced in 0.29.0. Live developer documentation was inspected at both
requested sizes after the production mark-me page disabled visit alerts.
