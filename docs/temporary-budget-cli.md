# Temporary budget CLI documentation

The `/developers/` page documents the forthcoming `goal-budgets` command,
`transactions --goal-budget-ref`, and the optional assignment destination. The
canonical schemas and feature contract are in sibling `sloth-budget`, under
`server/src/contracts/public/agent-v1/goalBudgets.ts` and
`docs/features/temporary-budgets.md`. The CLI owns generated copies of that schema.

The temporary-budget section is explicitly marked source-checkout-only while
the npm release remains pending. The existing released CLI documentation stays
on its published version. Remove the unreleased notice when the reviewed CLI
version is published, after the supporting API is healthy.

## Verification

- `yarn check:developer-cli-docs` checks the new command, filter and API references.
- `yarn check:public-site` checks the public page's existing crawl and metadata contract.
- `yarn build` passed, including deploy-output checks. Generated CSS was restored
  because this copy change uses existing classes and requires no styling changes.
- Desktop 1440×1024 and mobile 390×844 were inspected on the local `/developers/`
  page. No route, title, canonical URL, structured data, sitemap or robots change
  is needed. The existing app/page design was retained.

For review, run `yarn dev:server` from `/Users/rathbala/Code/sloth-site`, then open
`http://localhost:3000/developers/#temporary-budget-cli`. No sign-in is required;
Ctrl+C stops the preview. Check the temporary-budget section and mobile code-block
scrolling. The agent's isolated preview used 127.0.0.1:5376 and has been stopped.

## Privacy and visibility

The tracking inventory was reviewed. This documentation change introduces no
collection, provider, event, identifier or marketing-site API call. Existing
privacy copy, tracking inventory and analytics contracts remain unchanged.
Operational logs and product analytics are unchanged on this site. App-side
budget-save and assignment instrumentation is documented in `sloth-budget`.
