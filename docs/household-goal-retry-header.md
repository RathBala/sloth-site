# Household-goal retry header

The developer page documents the optional HTTP creation retry header added by sloth-budget for QA-008. The existing CLI and hosted MCP body contracts remain unchanged; this paragraph makes no retry guarantee for separate CLI/plugin invocations.

Data models and existing data: this site stores no new values and requires no migration. No obsolete page, route or implementation is replaced. The backend receipt model belongs to sloth-budget. Privacy copy, operational logging and product analytics are unchanged; no site data collection changes.

Verification: run `yarn build`, `yarn lint`, `yarn typecheck` and inspect `/developers/#household-goals` at desktop and mobile widths. The existing public-site check covers canonical URLs, metadata, static discoverability and route classifications. Publish after backend retry support is live. The household create examples and existing CLI version remain valid.
