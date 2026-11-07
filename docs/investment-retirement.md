# Investment balance transition

Release authorised on 7 November 2026. Canonical owners: sloth-budget app/API/MCP and plugin package, sloth-agent-cli 0.35.0, this public site. The matching app/API and production balance migration are live. CLI 0.35.0 is published and its registry artifact passes the fresh-install check. This site is released from main to Netlify after those prerequisites. The build checks publication and must not bypass it. Plugin 0.4.0 is an updated draft; the owner explicitly deferred submission.

Remove brokerage connections, holdings, trade history and their command/API examples. Existing investment accounts remain manually updated totals, with separate Investments labels, currencies, last observed dates and goal links. New manual account creation remains savings-only. There is no assumed investment return.

## Data models

The site stores no account data. Public docs describe retained account identity and manual balances. Privacy copy removes the retired provider and holdings access; existing analytics providers, consent posture and event payloads are unchanged. Operational logging and product analytics remain unchanged because this is a documentation and copy update.

## Public readiness

Public base: https://slothmoney.app. Static deployment directory: src. Existing canonical routes, robots policy, sitemap, noindex utilities and llms.txt discovery remain owned by scripts/check-public-site-readiness.mjs. Only descriptions change. Verify developer/copy/privacy/public-site checks and desktop/mobile renders. No crawler policy changes.

## Review

Use Node 22 and yarn browser-sync start --server src --port 5376 --no-open --no-ui --no-notify from this checkout. No sign-in. Check /, /developers/, /privacy/, /terms/ and /wedding-fund/ at 1440px and 390px. Stop with Ctrl+C after review. The owner authorised commit, push and deployment. Preview and emulator checks are complete; no local preview is retained after release. Site lint, typecheck, build, developer CLI docs, retirement, privacy/tracking and public readiness checks pass. Public production routes must be checked against the exact successful Netlify deployment. Existing analytics and crawler policies are unchanged.

## Release boundary

Existing investment account balances remain labelled Investments and editable in the app. Provider syncing, securities, trades and return assumptions are removed. The CLI and website describe the same contract. The plugin draft metadata and five skills pass checks; its portal MCP rescan is blocked by an existing-draft reconnect error. The established private cloud route remains verified. Public submission is deliberately deferred.
