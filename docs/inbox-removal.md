# Email-only Transaction Rules

The developer API guide describes email-only delivery and requires the published CLI 0.27.1. This is the public documentation part of the coordinated `sloth-budget`, `sloth-agent-cli` and `sloth-site` feed retirement. The budget repository owns the API, persistence cleanup and release record in `docs/operations/dashboard-feed-retirement.md`.

The existing email preference remains explicit: reminders are sent only when `delivery.email` is true. No route, metadata, crawler policy, authentication, analytics or privacy disclosure changes are needed: the same service-email processing remains while in-app feed processing is removed. No keyboard interaction changed.

Validation: `yarn build` passes the developer-copy, published-registry-version and public-site gates; `yarn lint` and `yarn typecheck` cover the final source. Desktop 1440×1000 and mobile 390×844 screenshots use this worktree's local server at `http://127.0.0.1:5276/developers/`. The build's minified CSS is restored to the repository's readable generated form before commit.

For local review, run `python3 -m http.server 5276 --bind 127.0.0.1 --directory src` from this repository. No sign-in is required. Check the CLI install version, Rules example and notification-rules endpoint description at both viewport sizes. Stop with Ctrl+C. Operational logging and product analytics are unchanged; no new diagnostic or learning question requires telemetry for this documentation correction.
